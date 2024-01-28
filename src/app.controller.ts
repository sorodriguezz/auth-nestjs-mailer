import { Body, Controller, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RequestSignupDto } from './dtos/request-signup.dto';
import { User } from './entities/user.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/signup')
  async signup(@Body() request: RequestSignupDto) {
    return await this.appService.signup(request);
  }

  @Post('/signin')
  async signin(@Body() user: User) {
    return await this.appService.signin(user);
  }

  @Post('/verify-code')
  async verifyWithCode(
    @Query('email') email: string,
    @Query('code') code: string,
  ) {
    return await this.appService.verifyAccount(email, code);
  }

  @Post('/verify-url')
  async verifyWithUrl() {
    // TODO implementar validacion por url
    // return await this.appService.verifyAccount(email, code);
  }
}
