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
import { RequestSignupDto } from './dtos/request-signup.dto';
import { User } from './entities/user.entity';
import { generateCodeHelper } from './helpers/generate-code.helper';
import { UserInsert } from './interfaces/user-insert.interface';
import { SendMailerService } from './services/mailer/send-mailer.service';
import { CommonProperties } from './properties/common.propertie';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly sendMailerService: SendMailerService,
    private jwtService: JwtService,
  ) {}

  async signup({
    email,
    fullname,
    password,
  }: RequestSignupDto): Promise<boolean | HttpException> {
    try {
      const existEmail = await this.userRepository.exists({
        where: { email: email },
      });

      if (existEmail) {
        return new HttpException(
          'Este email ya está registrado',
          HttpStatus.BAD_REQUEST,
        );
      }

      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);
      const code = generateCodeHelper().toString();

      const reqBody: UserInsert = {
        fullname: fullname,
        email: email,
        password: hash,
        authConfirmToken: code,
      };

      await this.userRepository.insert(reqBody);
      await this.sendMailerService.sendConfirmationEmail(reqBody);

      return true;
    } catch (error) {
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyAccount(
    email: string,
    code: string,
  ): Promise<boolean | HttpException> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user?.authConfirmToken) {
        return new HttpException('Email incorrecto', HttpStatus.BAD_REQUEST);
      }

      if (user.attempts >= CommonProperties.USER_ATTEMPTS) {
        return new HttpException(
          'Ha excedido el número de intentos',
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.userRepository.update(
        { email: user.email },
        { attempts: user.attempts + CommonProperties.USER_ATTEMPTS_AGG },
      );

      if (user.authConfirmToken !== code) {
        return new HttpException('Código incorrecto', HttpStatus.UNAUTHORIZED);
      }

      await this.userRepository.update(
        { email: user.email },
        {
          isVerified: true,
          authConfirmToken: '',
          isActive: true,
          attempts: null,
        },
      );

      await this.sendMailerService.sendConfirmedEmail(user);

      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async signin(user: User): Promise<any> {
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
        token: this.jwtService.sign(payload),
      };
    } catch (error) {
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
