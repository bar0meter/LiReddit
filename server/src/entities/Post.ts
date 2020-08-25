import { Field, ObjectType } from 'type-graphql'
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm'
import { User } from './User'

@Entity()
@ObjectType()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id!: number

  @Column()
  @Field()
  title!: string

  @Column()
  @Field()
  text!: string

  @Column({ type: 'int', default: 0 })
  @Field()
  points!: number

  @Field()
  @Column()
  creatorId: number

  @ManyToOne(() => User, (user) => user.posts)
  creator: User

  @CreateDateColumn()
  @Field(() => String)
  createdAt: Date

  @UpdateDateColumn()
  @Field(() => String)
  updatedAt: Date
}
