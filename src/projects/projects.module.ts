import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, JwtStrategy],
})
export class ProjectsModule {}
