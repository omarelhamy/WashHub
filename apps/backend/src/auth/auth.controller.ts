import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { ProviderLoginDto } from './dto/provider-login.dto';
import { ClientRequestOtpDto } from './dto/client-request-otp.dto';
import { ClientVerifyOtpDto } from './dto/client-verify-otp.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('super-admin/login')
  async superAdminLogin(@Body() dto: SuperAdminLoginDto) {
    return this.authService.loginSuperAdmin(dto.email, dto.password);
  }

  @Public()
  @Post('provider/login')
  async providerLogin(@Body() dto: ProviderLoginDto) {
    return this.authService.loginProviderUser(dto.phone, dto.password);
  }

  @Public()
  @Post('client/request-otp')
  async clientRequestOtp(@Body() dto: ClientRequestOtpDto) {
    return this.authService.requestOtp(dto.phone, dto.providerId);
  }

  @Public()
  @Post('client/verify-otp')
  async clientVerifyOtp(@Body() dto: ClientVerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.code, dto.providerId);
  }
}
