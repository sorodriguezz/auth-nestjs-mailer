import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  configModuleConfig,
  jwtConfig,
  mailerConfig,
  typeOrmConfig,
  typeOrmEntitiesConfig,
} from './config';
import { SendMailerService } from './services/mailer/send-mailer.service';

@Module({
  imports: [
    configModuleConfig,
    typeOrmConfig,
    typeOrmEntitiesConfig,
    jwtConfig,
    mailerConfig,
  ],
  controllers: [AppController],
  providers: [AppService, SendMailerService],
})
export class AppModule {}
