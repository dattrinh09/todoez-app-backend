import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { SprintDto, SprintUpdateDto } from './dto/sprints.dto';

@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) { }

  @Post('/:project_id')
  async createSprint(
    @Req() req,
    @Param() params: { project_id: string },
    @Body() dto: SprintDto
  ) {
    return await this.sprintsService.createSprint(
      req,
      parseInt(params.project_id),
      dto
    );
  }

  @Get('/:project_id')
  async getSprints(
    @Req() req,
    @Param() params: { project_id: string }
  ) {
    return await this.sprintsService.getSprints(
      req,
      parseInt(params.project_id)
    );
  }

  @Get('/:project_id/tasks')
  async getSprintsWithTasks(
    @Req() req,
    @Param() params: { project_id: string },
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return await this.sprintsService.getSprintsWithTasks(
      req,
      parseInt(params.project_id),
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put('/:project_id/:id')
  async updateSprint(
    @Req() req,
    @Param() params: { project_id: string, id: string },
    @Body() dto: SprintUpdateDto
  ) {
    return await this.sprintsService.updateSprint(
      req,
      parseInt(params.project_id),
      parseInt(params.id),
      dto
    );
  }

  @Delete('/:project_id/:id')
  async deleteSprint(
    @Req() req,
    @Param() params: { project_id: string, id: string }
  ) {
    return await this.sprintsService.deleteSprint(
      req,
      parseInt(params.project_id),
      parseInt(params.id)
    );
  }
}
