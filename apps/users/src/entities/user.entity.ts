import { Role } from 'contracts/enum/enums';
import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  @Column()
  location: string;

  @Column()
  occupation: string;

  @Column({ default: Role.User })
  role: Role;

  @CreateDateColumn({ default: Date.now() })
  createdAt: Date;
  
  @UpdateDateColumn({ default: Date.now() })
  updatedAt: Date;
}
