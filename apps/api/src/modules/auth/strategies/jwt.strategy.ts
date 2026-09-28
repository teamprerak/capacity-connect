import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Extract token from httpOnly cookie first, then fall back to Bearer header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwtSecret'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // Always resolve user + roles from DB — never trust client-supplied role claims
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
        trainerProfile: true,
        traineeProfile: true,
      },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User inactive or not found');
    }

    const resolvedRoles: any[] = user.userRoles.map((ur) => ({
      name: ur.role.name,
      permissions: ur.role.rolePermissions.map((rp) => rp.permission),
    }));

    // Fallback: If user has a trainerProfile in the DB, guarantee they possess the trainer role
    if (user.trainerProfile && !resolvedRoles.some((r) => r.name?.toLowerCase() === 'trainer')) {
      resolvedRoles.push({ name: 'trainer', permissions: [] });
    }

    // Fallback: If user has a traineeProfile in the DB, guarantee they possess the trainee role
    if (user.traineeProfile && !resolvedRoles.some((r) => r.name?.toLowerCase() === 'trainee')) {
      resolvedRoles.push({ name: 'trainee', permissions: [] });
    }

    // Shape the user object for downstream guards
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: resolvedRoles,
    };
  }
}
