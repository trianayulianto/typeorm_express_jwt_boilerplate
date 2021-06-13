import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
class PasswordReset {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('password_resets_email_index')
  @Column()
  email: string;

  @Column()
  token: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;
}

export default PasswordReset;
