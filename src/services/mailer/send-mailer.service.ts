import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { UserInsert } from './../../interfaces/user-insert.interface';

@Injectable()
export class SendMailerService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(user: UserInsert) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject:
          'Bienvenido a esta aplicación de prueba! Por favor, confirma el email',
        template: 'confirm',
        context: {
          fullname: user.fullname,
          code: user.authConfirmToken,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async sendConfirmedEmail(user: User) {
    try {
      const { email, fullname } = user;

      await this.mailerService.sendMail({
        to: email,
        subject: 'Bienvenido a esta aplicación de prueba! Email confirmado',
        template: 'confirmed',
        context: {
          fullname,
          email,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
