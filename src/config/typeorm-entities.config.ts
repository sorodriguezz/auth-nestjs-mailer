import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

export const typeOrmEntitiesConfig = TypeOrmModule.forFeature([User]);
