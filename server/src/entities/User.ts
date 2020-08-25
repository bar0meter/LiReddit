import { Field, Int, ObjectType } from 'type-graphql'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm'

import { Post } from './Post'

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number

  @Column({ unique: true })
  @Field(() => String)
  username!: string

  @Column({ unique: true })
  @Field(() => String)
  email!: string

  @Column()
  password!: string

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[]

  @CreateDateColumn()
  @Field(() => String)
  createdAt: Date

  @UpdateDateColumn()
  @Field(() => String)
  updatedAt: Date
}
