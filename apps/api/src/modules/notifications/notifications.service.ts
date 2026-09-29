import { Injectable } from '@nestjs/common';
import { Subject, Observable, filter } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  createdAt: string;
  read?: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly events$ = new Subject<AppNotification>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Push a notification to a specific user.
   * Saves to the database, then emits via SSE.
   */
  async push(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    try {
      const record = await this.prisma.notification.create({
        data: {
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          link: notification.link,
          read: false,
        },
      });

      this.events$.next({
        id: record.id,
        createdAt: record.createdAt.toISOString(),
        read: record.read,
        ...notification,
      });
    } catch (err) {
      console.error('Failed to save notification:', err);
    }
  }

  /**
   * Returns an Observable of notifications filtered for a specific user.
   */
  streamForUser(userId: string): Observable<AppNotification> {
    return this.events$.pipe(filter((n) => n.userId === userId));
  }

  /**
   * Get historical notifications for a user
   */
  async getUserNotifications(userId: string): Promise<AppNotification[]> {
    const records = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return records.map((r) => ({
      id: r.id,
      userId: r.userId,
      type: r.type,
      title: r.title,
      message: r.message,
      link: r.link ?? undefined,
      read: r.read,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
