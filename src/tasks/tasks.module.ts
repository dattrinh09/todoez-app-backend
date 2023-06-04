import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  controllers: [TasksController],
  providers: [TasksService, JwtStrategy],
})
export class TasksModule {}
