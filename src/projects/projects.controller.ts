import { Controller, Post, Get, Put, Delete, Req, Param, Body } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectDto } from './dto/projects.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post('')
  async createTeam(
    @Req() req,
    @Body() dto: ProjectDto
  ) {
    return await this.projectsService.createProject(req, dto);
  }

  @Get('')
  async getTeams(@Req() req) {
    return await this.projectsService.getProjects(req)
  }

  @Get('/:id')
  async getTeamById(
    @Req() req,
    @Param() params: { id: string }
  ) {
    return await this.projectsService.getProjectById(
      req,
      parseInt(params.id)
    );
  }

  @Put('/:id')
  async updateTeam(
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
  async deleteTeam(
    @Req() req,
    @Param() params: { id: string }
  ) {
    return await this.projectsService.deleteProject(
      req,
      parseInt(params.id)
    );
  }
}
