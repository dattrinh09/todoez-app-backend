import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskCreateDto, TaskUpdateDto } from './dto/tasks.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post('/:project_id')
  async createTask(
    @Req() req,
    @Param() params: { project_id: string },
    @Body() dto: TaskCreateDto
  ) {
    return await this.tasksService.createTask(req, parseInt(params.project_id), dto);
  }

  @Get('/:project_id')
  async getTasks(
    @Req() req,
    @Param() params: { project_id: string },
    @Query('type') type: string,
    @Query('status') status: string,
    @Query('priority') priority: string,
    @Query('keyword') keyword: string,
    @Query('assignee') assignee: string,
    @Query('reporter') reporter: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return await this.tasksService.getTasks(
      req,
      parseInt(params.project_id),
      type,
      status,
      priority,
      keyword,
      parseInt(assignee),
      parseInt(reporter),
      parseInt(page),
      parseInt(limit)
    );
  }

  @Get('/:project_id/:id')
  async getTaskById(
    @Req() req,
    @Param() params: { project_id: string, id: string }
  ) {
    return await this.tasksService.getTaskById(
      req,
      parseInt(params.project_id),
      parseInt(params.id)
    );
  }

  @Put('/:project_id/:id')
  async updateTask(
    @Req() req,
    @Param() params: { project_id: string, id: string },
    @Body() dto: TaskUpdateDto
  ) {
    return await this.tasksService.updateTask(
      req,
      parseInt(params.project_id),
      parseInt(params.id),
      dto
    );
  }

  @Delete('/:project_id/:id')
  async deleteTask(
    @Req() req,
    @Param() params: { project_id: string, id: string }
  ) {
    return await this.tasksService.deleteTask(
      req,
      parseInt(params.project_id),
      parseInt(params.id)
    );
  }
}
