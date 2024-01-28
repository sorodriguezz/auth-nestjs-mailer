import {
  BadRequestException,
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
        throw new BadRequestException('Este email ya está registrado');
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

      if (!foundUser) {
        return new HttpException(
          'Usuario o contraseña incorrectos',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!foundUser.isVerified) {
        return new HttpException(
          'Por favor verifique su cuenta',
          HttpStatus.FORBIDDEN,
        );
      }

      const isMatch = await bcrypt.compare(user.password, foundUser.password);

      if (!isMatch) {
        return new HttpException(
          'Usuario o contraseña incorrectos',
          HttpStatus.BAD_REQUEST,
        );
      }

      const payload = {
        email: user.email,
        fullname: foundUser.fullname,
      };

      return {
        token: jwt.sign(payload),
      };
    } catch (error) {
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
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
        { isVerified: true, authConfirmToken: '' },
      );

      await this.sendMailerService.sendConfirmedEmail(user);

      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
