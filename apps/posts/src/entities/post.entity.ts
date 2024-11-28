// apps/posts/src/entities/post.entity.ts
import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity()
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

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;
}
