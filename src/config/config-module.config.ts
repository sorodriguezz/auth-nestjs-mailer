import { ConfigModule } from '@nestjs/config';
import configuration from './config-env.config';

export const configModuleConfig = ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  load: [configuration],
});
