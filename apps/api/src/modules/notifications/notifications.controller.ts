import {
  Controller,
  Get,
  Req,
  Sse,
  MessageEvent,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { Observable, map } from 'rxjs';

/**
 * SSE Notifications Controller
 *
 * EventSource in browsers cannot send custom headers, so we extract the
 * JWT from:
 *   1. ?token= query parameter (used by the frontend EventSource)
 *   2. Authorization: Bearer header (usable from non-browser clients)
 *   3. httpOnly access_token cookie
 *
 * We skip the standard JwtAuthGuard and validate the token manually here,
 * because Passport's guard closes the SSE stream on any error.
 */
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Sse('stream')
  stream(@Req() req: any): Observable<MessageEvent> {
    const userId = this.extractUserId(req);
    return this.notificationsService.streamForUser(userId).pipe(
      map((notification) => ({
        data: JSON.stringify(notification),
        type: 'notification',
      } as MessageEvent)),
    );
  }

  private extractUserId(req: any): string {
    const secret = this.configService.get<string>('auth.jwtSecret');

    // 1. Query param: ?token=<jwt>  (EventSource browser default)
    const queryToken = req.query?.token as string | undefined;
    // 2. Authorization header
    const authHeader = req.headers?.authorization as string | undefined;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;
    // 3. Cookie
    const cookieToken = req.cookies?.access_token as string | undefined;

    const raw = queryToken ?? bearerToken ?? cookieToken;
    if (!raw) throw new UnauthorizedException('No token provided');

    try {
      const payload = this.jwtService.verify<{ sub: string }>(raw, { secret });
      if (!payload?.sub) throw new Error('Invalid payload');
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
