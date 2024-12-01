// apps/posts/src/entities/post.entity.ts
import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('posts')
export class Post {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  userId: ObjectId; // ID of the user who created the post

  @Column()
  // tag: ObjectId[]; // Array of IDs referencing other users
  tag: string[]; // Array of IDs referencing other users

  @Column({ type:  'array' })
  likes: ObjectId[]; // Array of IDs referencing users who liked the

  @Column({ type:  'array' })
  comments: ObjectId[]; // Array of IDs referencing comments

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;

  @UpdateDateColumn({ default: new Date() })
  updatedAt: Date;
}
