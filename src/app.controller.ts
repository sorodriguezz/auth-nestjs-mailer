import { Body, Controller, Post, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppService } from './app.service';
import { User } from './entities/user.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private jwtService: JwtService,
  ) {}

  @Post('/signup')
  async Signup(@Body() user: User) {
    return await this.appService.signup(user);
  }

  @Post('/signin')
  async Signin(@Body() user: User) {
    return await this.appService.signin(user, this.jwtService);
  }

  @Post('/verify')
  async Varify(@Query('email') email: string, @Query('code') code: string) {
    return await this.appService.varifyAccount(code, email);
  }
}
