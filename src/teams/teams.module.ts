import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  controllers: [TeamsController],
  providers: [TeamsService, JwtStrategy],
})
export class TeamsModule {}
