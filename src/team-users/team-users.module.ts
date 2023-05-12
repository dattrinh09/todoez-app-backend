import { Module } from '@nestjs/common';
import { TeamUsersService } from './team-users.service';
import { TeamUsersController } from './team-users.controller';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  controllers: [TeamUsersController],
  providers: [TeamUsersService, JwtStrategy],
})
export class TeamUsersModule {}
