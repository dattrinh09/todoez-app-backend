import { Controller, Post, Get, Delete, Req, Param, Body } from '@nestjs/common';
import { ProjectUsersService } from './project-users.service';
import { ProjectUserDto } from './dto/project-users.dto';

@Controller('project-users')
export class ProjectUsersController {
  constructor(private readonly projectUsersService: ProjectUsersService) { }

  @Post('/:project_id')
  async addUserToTeam(
    @Req() req,
    @Param() params: { project_id: string },
    @Body() dto: ProjectUserDto
  ) {
    return await this.projectUsersService.addUserToProject(
      req,
      parseInt(params.project_id),
      dto
    );
  }

  @Get('/:project_id')
  async getUsersInTeam(
    @Req() req,
    @Param() params: { project_id: string }
  ) {
    return await this.projectUsersService.getUsersInProject(
      req,
      parseInt(params.project_id)
    );
  }

  @Delete('/:project_id/:id')
  async deleteUserFromTeam(
    @Req() req,
    @Param() params: { project_id: string, id: string }
  ) {
    return await this.projectUsersService.deleteUserFromProject(
      req,
      parseInt(params.project_id),
      parseInt(params.id)
    );
  }
}
