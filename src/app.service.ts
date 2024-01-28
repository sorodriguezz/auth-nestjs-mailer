import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { generateCodeHelper } from './helpers/generate-code.helper';
import { SendMailerService } from './services/mailer/send-mailer.service';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly sendMailerService: SendMailerService,
  ) {}

  async signup(user: User): Promise<boolean> {
    try {
      const existEmail = await this.userRepository.exists({
        where: { email: user.email },
      });

      if (existEmail) {
        throw new Error('Este email ya está registrado');
      }

      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(user.password, salt);
      const code = generateCodeHelper().toString();

      const reqBody = {
        fullname: user.fullname,
        email: user.email,
        password: hash,
        authConfirmToken: code,
      };

      await this.userRepository.insert(reqBody);
      await this.sendMailerService.sendConfirmationEmail(reqBody);

      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async signin(user: User, jwt: JwtService): Promise<any> {
    try {
      const foundUser = await this.userRepository.findOne({
        where: { email: user.email },
      });

      if (foundUser) {
        if (foundUser.isVerified) {
          if (await bcrypt.compare(user.password, foundUser.password)) {
            const payload = { email: user.email };
            return {
              token: jwt.sign(payload),
            };
          }
        } else {
          return new HttpException(
            'Please varify your account',
            HttpStatus.UNAUTHORIZED,
          );
        }
        return new HttpException(
          'Incorrect username or password',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return new HttpException(
        'Incorrect username or password',
        HttpStatus.UNAUTHORIZED,
      );
    } catch (e) {
      return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async varifyAccount(code: string, email: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { authConfirmToken: code, email },
      });

      if (!user) {
        return new HttpException(
          'Codigo no encontrado o email incorrecto',
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.userRepository.update(
        { email: user.email },
        { isVerified: true, authConfirmToken: undefined },
      );

      await this.sendMailerService.sendConfirmedEmail(user);

      return true;
    } catch (e) {
      return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
