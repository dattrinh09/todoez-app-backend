import { Controller, Post, Get, Put, Delete, Param, Body, Req, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto, CommentUpdateDto } from './dto/comments.dto';
import { Request } from 'express';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post('/:project_id')
  async createComment(
    @Req() req: Request,
    @Param() params: { project_id: string },
    @Body() dto: CommentDto,
  ) {
    return await this.commentsService.createComment(
      req,
      parseInt(params.project_id),
      dto
    );
  }

  @Get('/:project_id/:task_id')
  async getComments(
    @Req() req: Request,
    @Param() params: { project_id: string, task_id: string },
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return await this.commentsService.getComments(
      req,
      parseInt(params.project_id),
      parseInt(params.task_id),
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put('/:project_id/:id')
  async updateComment(
    @Req() req: Request,
    @Param() params: { project_id: string, id: string },
    @Body() dto: CommentUpdateDto,
  ) {
    return await this.commentsService.updateComment(
      req,
      parseInt(params.project_id),
      parseInt(params.id),
      dto
    );
  }

  @Delete('/:project_id/:id')
  async deleteComment(
    @Req() req: Request,
    @Param() params: { project_id: string, id: string },
  ) {
    return await this.commentsService.deleteComment(
      req,
      parseInt(params.project_id),
      parseInt(params.id)
    );
  }
}
