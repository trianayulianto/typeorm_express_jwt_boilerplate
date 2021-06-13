import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';

@Entity()
class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  task: string;

  @Column({
    type: 'enum',
    enum: ['high', 'medium', 'low'],
    default: 'low',
  })
  priority: 'high' | 'medium' | 'low';

  @Column({ nullable: true })
  done: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.todos) user: User;
}

export default Todo;
