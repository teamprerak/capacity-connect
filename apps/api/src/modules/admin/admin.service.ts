import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus, VerificationStatus } from '@repo/db';
import { AuditService } from '../../common/services/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async getUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
          userRoles: { select: { role: { select: { name: true } } } },
          traineeProfile: { select: { id: true, jobTitle: true, specialtyTags: true } },
          trainerProfile: { select: { id: true, verificationStatus: true, jobTitle: true, specialtyTags: true } },
        }
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(id: string, status: UserStatus, adminId: string, ipAddress: string | null = null) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent self-suspension
    if (id === adminId && status === 'suspended') {
      throw new ForbiddenException('Administrators cannot suspend their own account');
    }

    // Prevent suspending another admin
    const isAdmin = user.userRoles.some((ur) => ur.role.name === 'admin');
    if (isAdmin && status === 'suspended') {
      throw new ForbiddenException('Administrator accounts cannot be suspended');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          status,
          suspendedBy: status === 'suspended' ? 'admin' : null,
          statusUpdatedBy: adminId,
          statusUpdatedAt: new Date(),
        },
        select: { id: true, email: true, status: true, suspendedBy: true }
      });

      await this.auditService.log({
        actorUserId: adminId,
        action: 'admin.user_status_updated',
        entityType: 'User',
        entityId: id,
        ipAddress,
        metadata: { status },
        prisma: tx,
      });

      if (status === 'active') {
        this.notifications.push({
          userId: id,
          type: 'account_activated',
          title: 'Account Activated',
          message: 'Your account has been activated. You can now access all features.',
        });
      } else if (status === 'suspended') {
        this.notifications.push({
          userId: id,
          type: 'account_deactivated',
          title: 'Account Suspended',
          message: 'Your account has been suspended by an administrator.',
        });
      }

      return updatedUser;
    });
  }

  async getPendingTrainers(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [trainers, total] = await Promise.all([
      this.prisma.trainerProfile.findMany({
        where: { verificationStatus: 'pending' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, status: true } },
          department: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.trainerProfile.count({
        where: { verificationStatus: 'pending' },
      }),
    ]);

    return {
      data: trainers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateTrainerVerification(id: string, status: VerificationStatus, adminId: string, ipAddress: string | null = null): Promise<any> {
    const trainer = await this.prisma.trainerProfile.findUnique({ where: { id } });
    if (!trainer) {
      throw new NotFoundException(`Trainer profile with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedTrainer = await tx.trainerProfile.update({
        where: { id },
        data: { verificationStatus: status },
        include: {
          user: { select: { id: true, email: true } },
        }
      });

      await this.auditService.log({
        actorUserId: adminId,
        action: 'admin.trainer_verified',
        entityType: 'TrainerProfile',
        entityId: id,
        ipAddress,
        metadata: { verificationStatus: status },
        prisma: tx,
      });

      return updatedTrainer;
    });
  }

  async getAuditLogs(page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, email: true } }
        }
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllTrainers(): Promise<any> {
    const trainers = await this.prisma.trainerProfile.findMany({
      include: {
        user: true,
        department: true,
        expertise: { include: { skill: true } }
      }
    });

    return trainers.map(t => {
      const names = t.user.email.split('@')[0].split('.');
      return {
        id: t.id,
        initials: names.map(n => n.charAt(0).toUpperCase()).join(''),
        name: names.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' '),
        title: t.jobTitle || 'Trainer', department: t.department?.name || 'General',
        rating: Number(t.trainerRatingAvg) || 4.5, // Dummy default if 0
        years: t.yearsExperience,
        level: t.yearsExperience > 10 ? 'Advanced' : 'Intermediate',
        description: t.detailedJobContext || t.bio || 'Specialist in training.',
        tags: [...t.expertise.map(e => e.skill.name), ...(t.specialtyTags || [])],
        verificationStatus: t.verificationStatus,
      };
    });
  }

  async getKnowledgeVault(): Promise<any> {
    const items = await this.prisma.knowledgeHubItem.findMany({
      include: { uploadedBy: true, department: true }
    });

    return {
      metrics: {
        capturedAssets: items.length,
        missionCritical: items.filter(i => i.criticality === 'Mission Critical').length,
        highRisk: items.filter(i => i.successionRisk === 'High').length,
        domains: new Set(items.map(i => i.subject)).size
      },
      assets: items.map(i => ({
        id: i.id,
        criticality: i.criticality || 'Normal',
        risk: i.successionRisk || 'Low',
        type: i.type,
        domain: i.subject,
        title: i.title,
        description: i.category, // Just map to category
        author: i.uploadedBy.email,
        date: i.createdAt
      }))
    };
  }

  async getMediaGovernance(): Promise<any> {
    const items = await this.prisma.knowledgeHubItem.findMany({
      include: { uploadedBy: true }
    });
    
    // We mock some data if none exist or map existing items
    return items.map(i => ({
      id: i.id,
      title: i.title,
      subtitle: i.subject,
      mappingType: 'Shared Library',
      mappingDetails: 'No module - No lesson',
      trainer: i.uploadedBy.email,
      mediaType: i.type,
      mediaLang: 'English',
      status: 'Published'
    }));
  }

  async getAnnouncements(): Promise<any> {
    const announcements = await this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return announcements.map(a => ({
      id: a.id,
      type: a.type || 'Resource',
      audience: a.audience,
      title: a.title,
      message: a.body,
      date: a.createdAt
    }));
  }

  async createAnnouncement(dto: any, adminId: string): Promise<any> {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        body: dto.message,
        type: dto.type || 'announcement',
        audience: dto.audience || 'all',
        createdById: adminId,
        publishedAt: new Date(),
      },
    });

    // Find target users
    const whereClause: any = { status: 'active' };
    if (announcement.audience === 'trainees') {
      whereClause.traineeProfile = { isNot: null };
    } else if (announcement.audience === 'trainers') {
      whereClause.trainerProfile = { isNot: null };
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: { id: true },
    });

    // Push notifications
    for (const user of users) {
      await this.notifications.push({
        userId: user.id,
        type: 'announcement',
        title: announcement.title,
        message: announcement.body,
        link: '/announcements', // Assuming there's an announcements page or similar
      });
    }

    return announcement;
  }
}
