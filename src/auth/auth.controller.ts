import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleSigninDto, ResetPasswordDto, SigninDto, SignupDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('/signup')
  async signup(@Body() dto: SignupDto) {
    return await this.authService.signup(dto);
  }

  @Public()
  @Post('/signin')
  async signin(@Body() dto: SigninDto) {
    return await this.authService.signin(dto);
  }

  @Public()
  @Post('google/signin')
  async googleSignin(@Body() dto: GoogleSigninDto) {
    return await this.authService.googleSignin(dto);
  }

  @Public()
  @Get('/verify/:email/:token')
  async verifyEmail(@Param() params: { email: string, token: string }) {
    return await this.authService.verifyEmail(params.email, params.token);
  }

  @Public()
  @Get('/forgot/:email')
  async forgotPassword(@Param() params: { email: string }) {
    return await this.authService.forgotPassword(params.email);
  }

  @Public()
  @Put('/reset-password/:email')
  async resetPassword(@Param() params: { email: string }, @Body() dto: ResetPasswordDto,) {
    return await this.authService.resetPassword(params.email, dto);
  }

  @Get('/signout')
  async signout() {
    return await this.authService.signout();
  }
}
