import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import User from './User';

@Entity()
class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.refreshToken, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  token: String;

  @Column({ type: 'timestamp' })
  expires: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created: Date;

  @Column({ name: 'created_by_ip' })
  createdByIp: String;

  @Column({ nullable: true, type: 'timestamp' })
  revoked: Date;

  @Column({ name: 'revoked_by_ip', nullable: true })
  revokedByIp: String;

  @Column({ name: 'replaced_by_token', nullable: true })
  replacedByToken: String;

  public get isExpired() {
    return new Date(Date.now()) >= this.expires;
  }

  public get isActive() {
    return !this.revoked && !this.isExpired;
  }
}

export default RefreshToken;
