import { Body, Controller, Delete, Param, Post, Put, Req } from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { SprintCreateDto, SprintUpdateDto } from './dto/sprints.dto';

@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) { }

  @Post('')
  async createSprint(@Req() req, @Body() dto: SprintCreateDto) {
    return await this.sprintsService.createSprint(req, dto);
  }

  @Put('/:id')
  async updateSprint(@Param() params: { id: string }, @Body() dto: SprintUpdateDto) {
    return await this.sprintsService.updateSprint(parseInt(params.id), dto);
  }


  @Delete('/:id')
  async deleteSprint(@Param() params: { id: string }) {
    return await this.sprintsService.deleteSprint(parseInt(params.id));
  }
}
