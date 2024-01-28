import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ name: 'fullname' })
  fullname: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'auth_confirm_token', nullable: true })
  authConfirmToken: string;

  @Column({ name: 'attempts', default: 0, nullable: true })
  attempts: number;

  @Column({ name: 'is_verified', default: false, nullable: true })
  isVerified: boolean;

  @Column({ name: 'is_active', default: false, nullable: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
