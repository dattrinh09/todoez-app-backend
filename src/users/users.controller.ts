import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangeAvatar, ChangePasswordDto, UpdateProfileDto } from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('/all-users')
  async getAllUsers(@Req() req) {
    return await this.usersService.getAllUsers(req);
  }

  @Get('/profile')
  async getUserProfile(@Req() req) {
    return await this.usersService.getUserProfile(req);
  }

  @Get('/:id')
  async getUserById(@Param() params: { id: string }) {
    return await this.usersService.getUserById(parseInt(params.id));
  }

  @Put('/change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return await this.usersService.changePassword(req, dto);
  }

  @Put('/update-profile')
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return await this.usersService.updateProfile(req, dto);
  }

  @Put('/change-avatar')
  async changeAvatar(@Req() req, @Body() dto: ChangeAvatar) {
    return await this.usersService.changeAvatar(req, dto);
  }

  @Put('/delete-avatar')
  async deleteAvatar(@Req() req) {
    return await this.usersService.deleteAvatar(req);
  }
}
