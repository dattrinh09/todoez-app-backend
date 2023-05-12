import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto, UpdateProfileDto } from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('/profile')
  async getUserProfile(@Req() req) {
    return await this.usersService.getUserProfile(req);
  }

  @Put('/change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return await this.usersService.changePassword(req, dto);
  }

  @Put('/update-profile')
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return await this.usersService.updateProfile(req, dto);
  }
}
