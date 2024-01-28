import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../../entities/user.entity';

@Injectable()
export class SendMailerService {
  constructor(private mailerService: MailerService) {}

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

  async sendConfirmationEmail(user: any) {
    try {
      const { email, fullname, authConfirmToken } = user;

      await this.mailerService.sendMail({
        to: email,
        subject:
          'Bienvenido a esta aplicación de prueba! Por favor, confirma el email',
        template: 'confirm',
        context: {
          fullname,
          code: authConfirmToken,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
