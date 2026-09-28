import { Injectable } from '@nestjs/common';
import { Subject, Observable, filter } from 'rxjs';

export interface AppNotification {
  id: string;
  userId: string;
  type:
    | 'enrollment'
    | 'course_approved'
    | 'course_rejected'
    | 'assessment_passed'
    | 'assessment_failed'
    | 'certificate_issued'
    | 'new_enrollment'
    | 'course_submitted'
    | 'account_activated'
    | 'account_deactivated'
    | 'user_registered'
    | 'competency_target_updated'
    | 'critical_gap_alert'
    | 'course_completed';
  title: string;
  message: string;
  link?: string;
  createdAt: string;
}

@Injectable()
export class NotificationsService {
  private readonly events$ = new Subject<AppNotification>();

  /**
   * Push a notification to a specific user.
   * Any active SSE connection subscribed to that userId will receive it.
   */
  push(notification: Omit<AppNotification, 'id' | 'createdAt'>): void {
    this.events$.next({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...notification,
    });
  }

  /**
   * Returns an Observable of notifications filtered for a specific user.
   * Used by the SSE controller to stream per-user events.
   */
  streamForUser(userId: string): Observable<AppNotification> {
    return this.events$.pipe(filter((n) => n.userId === userId));
  }
}
