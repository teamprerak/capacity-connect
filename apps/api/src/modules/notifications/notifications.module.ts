import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

/**
 * @Global() — makes NotificationsService available for injection
 * in all other modules without needing to import NotificationsModule each time.
 */
@Global()
@Module({
  imports: [
    JwtModule.register({}),   // token validated using ConfigService at runtime
    ConfigModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
