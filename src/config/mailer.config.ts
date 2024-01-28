import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

export const mailerConfig = MailerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    ...(await configService.get('configMailer')),
    template: {
      dir: join(__dirname, configService.get('EMAIL_PATH_TEMPLATES')),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
});
