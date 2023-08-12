import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountVerifyDto, GoogleSigninDto, RefreshTokenDto, ResetPasswordDto, SigninDto, SignupDto } from './dto/auth.dto';
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
  @Post('/forgot')
  async forgotPassword(@Body() dto: AccountVerifyDto) {
    return await this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('/verify-account')
  async verifyAccount(@Body() dto: AccountVerifyDto) {
    return await this.authService.verifyAccount(dto);
  }

  @Public()
  @Put('/reset-password/:email')
  async resetPassword(@Param() params: { email: string }, @Body() dto: ResetPasswordDto,) {
    return await this.authService.resetPassword(params.email, dto);
  }

  @Public()
  @Post('/refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.authService.refreshToken(dto);
  }

  @Get('/signout')
  async signout(@Req() req) {
    return await this.authService.signout(req);
  }
}
