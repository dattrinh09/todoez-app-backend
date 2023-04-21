import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConstants } from './utils/constants';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    UsersModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: mailerConstants.host,
          secure: false,
          auth: {
            user: mailerConstants.user,
            pass: mailerConstants.pass,
          },
        },
        defaults: {
          from: `"TodoEZ" <${mailerConstants.from}>`
        },
        template: {
          dir: join(__dirname, 'src/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          },
        },
      }),
    }),
  ],
})
export class AppModule {}
