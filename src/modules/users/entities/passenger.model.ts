import { ObjectType, Field, Int } from '@nestjs/graphql'
import { User } from './user.entity'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import {
  Column,
  Table,
  Index,
  BelongsTo,
  ForeignKey,
  DataType,
} from 'sequelize-typescript'

@ObjectType()
@Table({ tableName: 'passenger', timestamps: true })
export class Passenger extends BaseEntity<Passenger> {
  @Field(() => Int)
  @Column({ type: DataType.INTEGER, allowNull: false })
  @Index
  passportNumber: number

  @Field(() => String)
  @Column({ type: DataType.STRING, allowNull: false })
  nationality: string

  @Field(() => Date)
  @Column({ type: DataType.DATE, allowNull: false })
  dateOfBirth: Date

  @Field(() => String)
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: false, onDelete: 'CASCADE' })
  @Index
  userId: string

  @BelongsTo(() => User)
  user: User
}
