import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CourseStatus, EnrollmentStatus, ProgressStatus } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto, UpdateModuleDto } from './dto/create-module.dto';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─── Categories ───────────────────────────────────────────────────────────────

  async listCategories(): Promise<any> {
    return this.prisma.courseCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(dto: CreateCategoryDto): Promise<any> {
    return this.prisma.courseCategory.create({ data: { name: dto.name } });
  }

  // ─── Course CRUD ──────────────────────────────────────────────────────────────

  /**
   * H-7: Resolve a userId to the corresponding trainerProfile.id.
   * Returns null if the user has no trainer profile.
   */
  async getTrainerProfileIdForUser(userId: string): Promise<string | null> {
    const profile = await this.prisma.trainerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    return profile?.id ?? null;
  }

  /**
   * List courses with optional filters.
   * Admins and trainers may pass status filter to see draft/pending courses.
   * H-7: Accepts optional trainerId to scope results to a single trainer's courses.
   */
  async listCourses(filters: {
    status?: CourseStatus | 'all' | any;
    categoryId?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
    trainerId?: string;   // H-7: scope to a specific trainer
  }): Promise<any> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    // H-7: If scoped to a trainer, show all their statuses; otherwise default to published.
    if (filters.trainerId) {
      where.trainerId = filters.trainerId;
      if (filters.status && filters.status !== 'all') where.status = filters.status;
    } else {
      if (filters.status === 'all') {
        where.status = { not: CourseStatus.draft };
      } else if (filters.status) {
        where.status = filters.status;
      } else {
        where.status = CourseStatus.published;
      }
    }

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          category: true,
          trainer: { select: { id: true, user: { select: { email: true } } } },
          courseSkills: { include: { skill: true } },
          _count: { select: { enrollments: true, modules: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getCourse(id: string): Promise<any> {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        trainer: {
          select: {
            id: true,
            bio: true,
            yearsExperience: true,
            trainerRatingAvg: true,
            user: { select: { email: true } },
          },
        },
        courseSkills: { include: { skill: true } },
        prerequisites: {
          include: {
            prerequisite: { select: { id: true, title: true, slug: true } },
          },
        },
        modules: {
          orderBy: { sequenceOrder: 'asc' },

        },
        assessments: {
          select: {
            id: true,
            subject: true,
            type: true,
            timeLimitMinutes: true,
            passScorePct: true,
            _count: { select: { questions: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async createCourse(
    trainerUserId: string,
    dto: CreateCourseDto,
    ipAddress: string | null = null,
  ): Promise<any> {
    const trainerProfile = await this._requireTrainerProfile(trainerUserId);
    const slug = this._slugify(dto.title) + '-' + Date.now();
    const { skillIds, newCategoryName, ...courseData } = dto;

    let finalCategoryId = courseData.categoryId;
    if (finalCategoryId === 'other' || (!finalCategoryId && newCategoryName)) {
      if (!newCategoryName) {
        throw new BadRequestException('newCategoryName is required when creating a custom category');
      }
      let category = await this.prisma.courseCategory.findFirst({
        where: { name: { equals: newCategoryName, mode: 'insensitive' } },
      });
      if (!category) {
        category = await this.prisma.courseCategory.create({ data: { name: newCategoryName } });
      }
      finalCategoryId = category.id;
    } else if (!finalCategoryId) {
      let defaultCat = this.prisma.courseCategory?.findFirst ? await this.prisma.courseCategory.findFirst() : null;
      if (!defaultCat && this.prisma.courseCategory?.create) {
        defaultCat = await this.prisma.courseCategory.create({
          data: { name: 'Cloud & Software Engineering' },
        });
      }
      finalCategoryId = defaultCat?.id;
    }

    return this.prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          ...courseData,
          categoryId: finalCategoryId,
          slug,
          trainerId: trainerProfile.id,
          status: CourseStatus.draft,
          ...(skillIds?.length
            ? {
                courseSkills: {
                  create: skillIds.map((skillId) => ({ skillId })),
                },
              }
            : {}),
        },
        include: { category: true, courseSkills: { include: { skill: true } } },
      });

      await this.auditService.log({
        actorUserId: trainerUserId,
        action: 'course.created',
        entityType: 'Course',
        entityId: course.id,
        ipAddress,
        metadata: { title: dto.title },
        prisma: tx,
      });

      return course;
    });
  }

  async updateCourse(
    trainerUserId: string,
    courseId: string,
    dto: UpdateCourseDto,
    isAdmin = false,
    ipAddress: string | null = null,
  ): Promise<any> {
    const course = await this._requireCourse(courseId);
    if (!isAdmin) {
      await this._assertCourseOwner(trainerUserId, course);
    }
    const { skillIds, newCategoryName, ...courseData } = dto;

    if (courseData.categoryId === 'other' || newCategoryName) {
      if (!newCategoryName) {
        throw new BadRequestException('newCategoryName is required when creating a custom category');
      }
      let category = await this.prisma.courseCategory.findFirst({
        where: { name: { equals: newCategoryName, mode: 'insensitive' } },
      });
      if (!category) {
        category = await this.prisma.courseCategory.create({ data: { name: newCategoryName } });
      }
      courseData.categoryId = category.id;
    }

    // M-2: Reject any attempt to change status through the general update endpoint.
    // Status transitions have dedicated endpoints: /submit, /approve, /reject, /archive.
    if ('status' in courseData) {
      throw new BadRequestException(
        'Cannot set status via this endpoint. Use /courses/:id/submit, /approve, /reject, or /archive for status transitions.',
      );
    }

    let downgraded = false;
    if (!isAdmin && (course.status === CourseStatus.published || course.status === CourseStatus.archived)) {
      (courseData as any).status = CourseStatus.pending_approval;
      downgraded = true;
    }

    return this.prisma.$transaction(async (tx) => {
      if (skillIds !== undefined) {
        await tx.courseSkill.deleteMany({ where: { courseId } });
      }

      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: {
          ...courseData,
          ...(skillIds?.length
            ? {
                courseSkills: {
                  create: skillIds.map((skillId) => ({ skillId })),
                },
              }
            : {}),
        },
        include: { category: true, courseSkills: { include: { skill: true } } },
      });

      await this.auditService.log({
        actorUserId: trainerUserId,
        action: 'course.updated',
        entityType: 'Course',
        entityId: courseId,
        ipAddress,
        metadata: {
          fieldsUpdated: Object.keys(dto),
          ...(downgraded ? { revertedToPending: true } : {}),
        },
        prisma: tx,
      });

      return updatedCourse;
    });
  }

  async deleteCourse(
    userId: string,
    courseId: string,
    isAdmin = false,
    ipAddress: string | null = null,
  ): Promise<any> {
    const course = await this._requireCourse(courseId);
    if (!isAdmin) {
      await this._assertCourseOwner(userId, course);
    } else if (course.status === CourseStatus.draft) {
      // Admins cannot delete trainers' drafts (unless they happen to be the trainer who owns it)
      const profile = await this.prisma.trainerProfile.findUnique({
        where: { userId },
      }).catch(() => null);
      if (!profile || profile.id !== course.trainerId) {
        throw new ForbiddenException(
          'Administrators cannot delete draft courses belonging to trainers.',
        );
      }
    }
    return this.prisma.$transaction(async (tx) => {
      const deletedCourse = await tx.course.update({
        where: { id: courseId },
        data: { deletedAt: new Date() },
      });

      await this.auditService.log({
        actorUserId: userId,
        action: 'course.deleted',
        entityType: 'Course',
        entityId: courseId,
        ipAddress,
        metadata: null,
        prisma: tx,
      });

      return deletedCourse;
    });
  }

  async archiveCourse(
    userId: string,
    courseId: string,
    isAdmin = false,
    ipAddress: string | null = null,
  ): Promise<any> {
    const course = await this._requireCourse(courseId);
    if (!isAdmin) {
      await this._assertCourseOwner(userId, course);
    }
    if (course.status !== CourseStatus.published) {
      throw new BadRequestException('Only published courses can be archived');
    }
    return this.prisma.$transaction(async (tx) => {
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: { status: CourseStatus.archived },
      });

      await this.auditService.log({
        actorUserId: userId,
        action: 'course.status_changed',
        entityType: 'Course',
        entityId: courseId,
        ipAddress,
        metadata: { newStatus: CourseStatus.archived },
        prisma: tx,
      });

      return updatedCourse;
    });
  }

  async unarchiveCourse(
    userId: string,
    courseId: string,
    isAdmin = false,
    ipAddress: string | null = null,
  ): Promise<any> {
    const course = await this._requireCourse(courseId);
    if (!isAdmin) {
      await this._assertCourseOwner(userId, course);
    }
    if (course.status !== CourseStatus.archived) {
      throw new BadRequestException('Only archived courses can be unarchived');
    }
    return this.prisma.$transaction(async (tx) => {
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: { status: CourseStatus.published },
      });

      await this.auditService.log({
        actorUserId: userId,
        action: 'course.unarchived',
        entityType: 'Course',
        entityId: courseId,
        ipAddress,
        metadata: { newStatus: CourseStatus.published },
        prisma: tx,
      });

      return updatedCourse;
    });
  }

  async submitForApproval(trainerUserId: string, courseId: string, ipAddress: string | null = null): Promise<any> {
    const course = await this._requireCourse(courseId);
    await this._assertCourseOwner(trainerUserId, course);

    if (course.status !== CourseStatus.draft) {
      throw new BadRequestException(
        'Only draft courses can be submitted for approval',
      );
    }

    const moduleCount = await this.prisma.courseModule.count({
      where: { courseId },
    });
    if (moduleCount === 0) {
      throw new BadRequestException(
        'Course must have at least one module before submission',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: { status: CourseStatus.pending_approval },
      });

      await this.auditService.log({
        actorUserId: trainerUserId,
        action: 'course.status_changed',
        entityType: 'Course',
        entityId: courseId,
        ipAddress,
        metadata: { newStatus: CourseStatus.pending_approval },
        prisma: tx,
      });

      let admins: any[] = [];
      try {
        if (tx.userRole?.findMany) {
          admins = await tx.userRole.findMany({
            where: { role: { name: 'admin' } },
            select: { userId: true },
          });
        }
      } catch {}
      admins?.forEach((admin) => {
        this.notifications.push({
          userId: admin.userId,
          type: 'course_submitted',
          title: 'Course Requires Approval',
          message: `The course "${updatedCourse.title}" has been submitted for approval.`,
          link: '/admin/courses',
        });
      });

      return updatedCourse;
    });
  }

  async approveCourse(adminUserId: string, courseId: string, ipAddress: string | null = null): Promise<any> {
    const course = await this._requireCourse(courseId);
    if (course.status !== CourseStatus.pending_approval) {
      throw new BadRequestException('Course is not pending approval');
    }
    return this.prisma.$transaction(async (tx) => {
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: {
          status: CourseStatus.published,
          approvedById: adminUserId,
          approvedAt: new Date(),
        },
      });

      await this.auditService.log({
        actorUserId: adminUserId,
        action: 'course.status_changed',
        entityType: 'Course',
        entityId: courseId,
        ipAddress,
        metadata: { newStatus: CourseStatus.published },
        prisma: tx,
      });

      // ─── Notify the trainer ─────────────────────────────────────────────
      let trainerUser: any = null;
      try {
        if (this.prisma.trainerProfile?.findUnique) {
          trainerUser = await this.prisma.trainerProfile.findUnique({
            where: { id: course.trainerId },
            select: { userId: true },
          });
        }
      } catch {}
      if (trainerUser) {
        this.notifications.push({
          userId: trainerUser.userId,
          type: 'course_approved',
          title: 'Course approved!',
          message: `Your course "${course.title}" has been approved and is now published.`,
          link: `/trainer`,
        });
      }

      return updatedCourse;
    });
  }

  async rejectCourse(adminUserId: string, courseId: string, ipAddress: string | null = null): Promise<any> {
    const course = await this._requireCourse(courseId);
    if (course.status !== CourseStatus.pending_approval) {
      throw new BadRequestException('Course is not pending approval');
    }
    return this.prisma.$transaction(async (tx) => {
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: { status: CourseStatus.draft },
      });

      await this.auditService.log({
        actorUserId: adminUserId,
        action: 'course.status_changed',
        entityType: 'Course',
        entityId: courseId,
        ipAddress,
        metadata: { newStatus: CourseStatus.draft },
        prisma: tx,
      });

      // ─── Notify the trainer ─────────────────────────────────────────────
      const trainerUser2 = await this.prisma.trainerProfile.findUnique({
        where: { id: course.trainerId },
        select: { userId: true },
      }).catch(() => null);
      if (trainerUser2) {
        this.notifications.push({
          userId: trainerUser2.userId,
          type: 'course_rejected',
          title: 'Course needs revisions',
          message: `Your course "${course.title}" was returned for revisions. Please update it and resubmit.`,
          link: `/trainer`,
        });
      }

      return updatedCourse;
    });
  }

  // ─── Modules ──────────────────────────────────────────────────────────────────

  async addModule(
    trainerUserId: string,
    courseId: string,
    dto: CreateModuleDto,
  ): Promise<any> {
    const course = await this._requireCourse(courseId);
    await this._assertCourseOwner(trainerUserId, course);

    const requiresReview = course.status === CourseStatus.published || course.status === CourseStatus.archived;

    return this.prisma.$transaction(async (tx) => {
      const module = await tx.courseModule.create({
        data: {
          courseId,
          title: dto.title,
          sequenceOrder: dto.sequenceOrder,
          videoUrl: dto.videoUrl || null,
          documentUrl: dto.documentUrl || null,
        },
      });

      if (requiresReview) {
        await tx.course.update({
          where: { id: courseId },
          data: { status: CourseStatus.pending_approval },
        });
        await this.auditService.log({
          actorUserId: trainerUserId,
          action: 'course.status_changed',
          entityType: 'Course',
          entityId: courseId,
          ipAddress: null,
          metadata: { newStatus: CourseStatus.pending_approval, reason: 'Module added' },
          prisma: tx,
        });
      }

      return module;
    });
  }

  async updateModule(
    trainerUserId: string,
    courseId: string,
    moduleId: string,
    dto: UpdateModuleDto,
  ): Promise<any> {
    const course = await this._requireCourse(courseId);
    await this._assertCourseOwner(trainerUserId, course);

    const requiresReview = course.status === CourseStatus.published || course.status === CourseStatus.archived;

    return this.prisma.$transaction(async (tx) => {
      const mod = await tx.courseModule.findFirst({
        where: { id: moduleId, courseId },
      });
      if (!mod) throw new NotFoundException('Module not found');

      const updatedModule = await tx.courseModule.update({
        where: { id: moduleId },
        data: dto,
      });

      if (requiresReview) {
        await tx.course.update({
          where: { id: courseId },
          data: { status: CourseStatus.pending_approval },
        });
        await this.auditService.log({
          actorUserId: trainerUserId,
          action: 'course.status_changed',
          entityType: 'Course',
          entityId: courseId,
          ipAddress: null,
          metadata: { newStatus: CourseStatus.pending_approval, reason: 'Module updated' },
          prisma: tx,
        });
      }

      return updatedModule;
    });
  }

  async deleteModule(
    trainerUserId: string,
    courseId: string,
    moduleId: string,
  ): Promise<any> {
    const course = await this._requireCourse(courseId);
    await this._assertCourseOwner(trainerUserId, course);

    const requiresReview = course.status === CourseStatus.published || course.status === CourseStatus.archived;

    return this.prisma.$transaction(async (tx) => {
      const mod = await tx.courseModule.findFirst({
        where: { id: moduleId, courseId },
      });
      if (!mod) throw new NotFoundException('Module not found');

      const deletedModule = await tx.courseModule.delete({ where: { id: moduleId } });

      if (requiresReview) {
        await tx.course.update({
          where: { id: courseId },
          data: { status: CourseStatus.pending_approval },
        });
        await this.auditService.log({
          actorUserId: trainerUserId,
          action: 'course.status_changed',
          entityType: 'Course',
          entityId: courseId,
          ipAddress: null,
          metadata: { newStatus: CourseStatus.pending_approval, reason: 'Module deleted' },
          prisma: tx,
        });
      }

      return deletedModule;
    });
  }

  // ─── Enrollment & Progress ────────────────────────────────────────────────────

  async enroll(traineeUserId: string, dto: EnrollCourseDto, ipAddress: string | null = null): Promise<any> {
    const traineeProfile = await this._requireTraineeProfile(traineeUserId);
    const course = await this._requireCourse(dto.courseId);

    if (course.status !== CourseStatus.published) {
      throw new BadRequestException('Can only enroll in published courses');
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.enrollment.findUnique({
        where: {
          traineeId_courseId: {
            traineeId: traineeProfile.id,
            courseId: dto.courseId,
          },
        },
      });
      if (existing) throw new ConflictException('Already enrolled in this course');

      const enrollment = await tx.enrollment.create({
        data: {
          traineeId: traineeProfile.id,
          courseId: dto.courseId,
          status: EnrollmentStatus.started,
        },
        include: { course: { select: { title: true, slug: true } } },
      });

      const modules = await tx.courseModule.findMany({
        where: { courseId: dto.courseId },
      });
      if (modules.length) {
        await tx.courseProgress.createMany({
          data: modules.map((m) => ({
            enrollmentId: enrollment.id,
            moduleId: m.id,
            status: ProgressStatus.not_started,
            progressPct: 0,
          })),
          skipDuplicates: true,
        });
      }

      await this.auditService.log({
        actorUserId: traineeUserId,
        action: 'course.enrolled',
        entityType: 'Enrollment',
        entityId: enrollment.id,
        ipAddress,
        metadata: { courseId: dto.courseId },
        prisma: tx,
      });

      // ─── Real-time notifications ──────────────────────────────────────────
      // 1. Notify the trainee
      const courseTitle = enrollment?.course?.title || course?.title || 'your course';
      this.notifications.push({
        userId: traineeUserId,
        type: 'enrollment',
        title: 'Enrolled successfully!',
        message: `You are now enrolled in "${courseTitle}". Start learning!`,
        link: `/trainee/courses/${dto.courseId}/learn`,
      });

      // 2. Notify the course trainer about the new enrollment
      let trainerUser: any = null;
      try {
        if (this.prisma.trainerProfile?.findUnique) {
          trainerUser = await this.prisma.trainerProfile.findUnique({
            where: { id: course.trainerId },
            select: { userId: true },
          });
        }
      } catch {}
      if (trainerUser) {
        this.notifications.push({
          userId: trainerUser.userId,
          type: 'new_enrollment',
          title: 'New enrollment',
          message: `A trainee just enrolled in "${courseTitle}".`,
          link: `/trainer`,
        });
      }

      return enrollment;
    });
  }

  async getMyEnrollments(traineeUserId: string): Promise<any> {
    const traineeProfile = await this._requireTraineeProfile(traineeUserId);
    return this.prisma.enrollment.findMany({
      where: { traineeId: traineeProfile.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            difficulty: true,
            durationMinutes: true,
            category: true,
          },
        },
        progress: true,
        certificate: { select: { id: true, certificateNumber: true, issuedAt: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async getEnrollment(enrollmentId: string, userId: string, isPrivileged = false): Promise<any> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: { orderBy: { sequenceOrder: 'asc' } },
          },
        },
        progress: true,
        trainee: { select: { userId: true } },
        certificate: {
          select: { id: true, certificateNumber: true, issuedAt: true, verificationToken: true },
        },
      },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    // C-4: Enforce ownership — trainees can only see their own enrollment.
    if (!isPrivileged && enrollment.trainee.userId !== userId) {
      throw new ForbiddenException('You do not have access to this enrollment');
    }

    return enrollment;
  }

  async updateProgress(
    traineeUserId: string,
    enrollmentId: string,
    dto: UpdateProgressDto,
  ): Promise<any> {
    const traineeProfile = await this._requireTraineeProfile(traineeUserId);

    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, traineeId: traineeProfile.id },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    if (
      enrollment.status === EnrollmentStatus.completed ||
      enrollment.status === EnrollmentStatus.abandoned
    ) {
      throw new BadRequestException('Cannot update progress on a closed enrollment');
    }

    const status: ProgressStatus =
      dto.progressPct >= 100
        ? ProgressStatus.completed
        : dto.progressPct > 0
          ? ProgressStatus.in_progress
          : ProgressStatus.not_started;

    // H-3: Wrap both writes in a single transaction so progress and enrollment
    // status are always updated atomically. A crash between them is no longer possible.
    return this.prisma.$transaction(async (tx) => {
      const progress = await tx.courseProgress.upsert({
        where: {
          enrollmentId_moduleId: {
            enrollmentId,
            moduleId: dto.moduleId,
          },
        },
        create: {
          enrollmentId,
          moduleId: dto.moduleId,
          progressPct: dto.progressPct,
          status,
          lastAccessedAt: new Date(),
        },
        update: {
          progressPct: dto.progressPct,
          status,
          lastAccessedAt: new Date(),
        },
      });

      // Check if all modules are complete → auto-complete enrollment (within same tx)
      await this._checkAndCompleteEnrollment(enrollmentId, tx);

      return progress;
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async _checkAndCompleteEnrollment(
    enrollmentId: string,
    tx?: any,
  ): Promise<void> {
    // H-3: Use the passed transaction client if available, otherwise fall back to the root client.
    const db = (tx as any) ?? this.prisma;
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: { include: { modules: true } }, progress: true },
    });
    if (!enrollment || enrollment.status === EnrollmentStatus.completed) return;

    const totalModules = enrollment.course.modules.length;
    if (totalModules === 0) return;

    const completedModules = enrollment.progress.filter(
      (p) => p.status === ProgressStatus.completed,
    ).length;

    if (completedModules >= totalModules) {
      await db.enrollment.update({
        where: { id: enrollmentId },
        data: { status: EnrollmentStatus.completed, completedAt: new Date() },
      });

      const traineeUser = await db.traineeProfile.findUnique({
        where: { id: enrollment.traineeId },
        select: { userId: true },
      });
      if (traineeUser) {
        this.notifications.push({
          userId: traineeUser.userId,
          type: 'course_completed',
          title: 'Course Completed!',
          message: `Congratulations! You have completed all modules for "${enrollment.course.title}".`,
          link: `/trainee/courses/${enrollment.courseId}`,
        });
      }
    } else if (enrollment.status === EnrollmentStatus.started) {
      await db.enrollment.update({
        where: { id: enrollmentId },
        data: { status: EnrollmentStatus.in_progress },
      });
    }
  }

  private async _requireCourse(courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  private async _requireTrainerProfile(userId: string) {
    let profile = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { userRoles: { include: { role: true } } },
      });
      const isPrivileged = user?.userRoles?.some(
        (ur) => ur.role?.name?.toLowerCase() === 'trainer' || ur.role?.name?.toLowerCase() === 'admin',
      );
      if (isPrivileged) {
        profile = await this.prisma.trainerProfile.create({
          data: {
            userId,
            bio: 'Certified Enterprise Trainer & Subject Specialist',
            verificationStatus: 'verified',
            yearsExperience: 5,
          },
        });
      } else {
        throw new NotFoundException('Trainer profile not found');
      }
    }
    return profile;
  }

  private async _requireTraineeProfile(userId: string) {
    const profile = await this.prisma.traineeProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Trainee profile not found');
    return profile;
  }

  private async _assertCourseOwner(userId: string, course: any): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    const isAdmin = user?.userRoles?.some((ur) => ur.role?.name?.toLowerCase() === 'admin');
    if (isAdmin) return;

    let trainerProfile = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });
    if (!trainerProfile) {
      const isTrainer = user?.userRoles?.some((ur) => ur.role?.name?.toLowerCase() === 'trainer');
      if (isTrainer && this.prisma.trainerProfile?.create) {
        trainerProfile = await this.prisma.trainerProfile.create({
          data: {
            userId,
            bio: 'Certified Enterprise Trainer & Subject Specialist',
            verificationStatus: 'verified',
            yearsExperience: 5,
          },
        });
      }
    }
    if (!trainerProfile || course.trainerId !== trainerProfile.id) {
      throw new ForbiddenException('You do not own this course');
    }
  }

  private _slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
