import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  Sse,
  MessageEvent,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { Observable, map } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getHistoricalNotifications(@CurrentUser() user: any) {
    return this.notificationsService.getUserNotifications(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  async markAllRead(@CurrentUser() user: any) {
    await this.notificationsService.markAllAsRead(user.userId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markRead(@Param('id') id: string, @CurrentUser() user: any) {
    await this.notificationsService.markAsRead(id, user.userId);
    return { success: true };
  }

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

    const queryToken = req.query?.token as string | undefined;
    const authHeader = req.headers?.authorization as string | undefined;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;
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
