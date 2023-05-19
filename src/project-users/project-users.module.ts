import { Module } from '@nestjs/common';
import { ProjectUsersService } from './project-users.service';
import { ProjectUsersController } from './project-users.controller';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  controllers: [ProjectUsersController],
  providers: [ProjectUsersService, JwtStrategy],
})
export class ProjectUsersModule {}
