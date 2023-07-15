import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConstants } from './utils/constants';
import { TeamUsersModule } from './team-users/team-users.module';
import { TeamsModule } from './teams/teams.module';
import { ProjectsModule } from './projects/projects.module';
import { ProjectUsersModule } from './project-users/project-users.module';
import { SprintsModule } from './sprints/sprints.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { NotesModule } from './notes/notes.module';

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
      }),
    }),
    TeamUsersModule,
    TeamsModule,
    ProjectsModule,
    ProjectUsersModule,
    SprintsModule,
    TasksModule,
    CommentsModule,
    NotesModule,
  ],
})
export class AppModule {}
