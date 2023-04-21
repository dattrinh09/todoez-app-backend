import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleSigninDto, ResetPasswordDto, SigninDto, SignupDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup')
  async signup(@Body() dto: SignupDto) {
    return await this.authService.signup(dto);
  }

  @Post('/signin')
  async signin(@Body() dto: SigninDto) {
    return await this.authService.signin(dto);
  }

  @Post('google/signin')
  async googleSignin(@Body() dto: GoogleSigninDto) {
    return await this.authService.googleSignin(dto);
  }

  @Get('/verify/:email/:token')
  async verifyEmail(@Param() params: { email: string, token: string }) {
    return await this.authService.verifyEmail(params.email, params.token);
  }

  @Get('/forgot/:email')
  async forgotPassword(@Param() params: { email: string }) {
    return await this.authService.forgotPassword(params.email);
  }

  @Put('/reset-password/:email')
  async resetPassword(@Param() params: { email: string }, @Body() dto: ResetPasswordDto,) {
    return await this.authService.resetPassword(params.email, dto);
  }

  @Get('/signout')
  async signout() {
    return await this.authService.signout();
  }
}
