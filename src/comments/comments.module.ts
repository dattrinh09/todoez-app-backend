import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, JwtStrategy]
})
export class CommentsModule {}
