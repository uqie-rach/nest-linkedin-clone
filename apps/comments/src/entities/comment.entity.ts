import {
  Entity,
  Column,
  ObjectIdColumn,
  ObjectId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @ObjectIdColumn({ primary: true })
  _id: ObjectId;

  @Column()
  post: ObjectId;

  @Column()
  user: ObjectId;

  @Column()
  content: string;

  @Column({ type: 'array', default: [] })
  likes?: ObjectId[];

  @CreateDateColumn({ default: new Date() })
  createdAt?: Date;

  @UpdateDateColumn({ default: new Date() })
  updatedAt?: Date;
}
