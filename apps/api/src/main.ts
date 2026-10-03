import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.use(cookieParser());
  app.use(helmet());

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:3000'];

  app.setGlobalPrefix('api/v1');

  // BUG-20: Only allow specific vercel project subdomain, not all *.vercel.app (any attacker can get one)
  const vercelProjectPattern = process.env.VERCEL_PROJECT_NAME
    ? new RegExp(`^https://${process.env.VERCEL_PROJECT_NAME}(-[a-z0-9]+)?\.vercel\.app$`)
    : null;

  app.enableCors({
    origin: (origin, callback) => {
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        (vercelProjectPattern && vercelProjectPattern.test(origin))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  });
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`API running on port ${port}`);
}
bootstrap();
