import { Controller, Post, Get, Put, Delete, Req, Param, Body } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectDto } from './dto/projects.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post('')
  async createProject(
    @Req() req,
    @Body() dto: ProjectDto
  ) {
    return await this.projectsService.createProject(req, dto);
  }

  @Get('')
  async getProjects(@Req() req) {
    return await this.projectsService.getProjects(req)
  }

  @Get('/:id')
  async getProjectById(
    @Req() req,
    @Param() params: { id: string }
  ) {
    return await this.projectsService.getProjectById(
      req,
      parseInt(params.id)
    );
  }

  @Put('/:id')
  async updateProject(
    @Req() req,
    @Param() params: { id: string },
    @Body() dto: ProjectDto
  ) {
    return await this.projectsService.updateProject(
      req,
      parseInt(params.id),
      dto
    );
  }

  @Delete('/:id')
  async deleteProject(
    @Req() req,
    @Param() params: { id: string }
  ) {
    return await this.projectsService.deleteProject(
      req,
      parseInt(params.id)
    );
  }
}
