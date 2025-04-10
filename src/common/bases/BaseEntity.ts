import { ulid } from 'ulid'
import { Field, ID, ObjectType } from '@nestjs/graphql'
import {
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
} from 'sequelize-typescript'

@ObjectType()
export abstract class BaseEntity<T> extends Model<T> {
  @Field(() => ID)
  @Column({
    type: DataType.STRING(26),
    primaryKey: true,
    defaultValue: () => ulid(),
  })
  id: string

  @CreatedAt
  @Field(() => Date)
  createdAt: Date

  @UpdatedAt
  @Field(() => Date)
  updatedAt: Date
}
