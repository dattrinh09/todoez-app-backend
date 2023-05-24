import { Module } from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { SprintsController } from './sprints.controller';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  controllers: [SprintsController],
  providers: [SprintsService, JwtStrategy],
})
export class SprintsModule {}
