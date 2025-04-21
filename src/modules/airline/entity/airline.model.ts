import { Field, ObjectType } from '@nestjs/graphql'
import { User } from 'src/modules/users/entities/user.entity'
import { Location } from 'src/modules/location/entity/location.model'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { Flight } from 'src/modules/flight/entity/flight.model'
import {
  Column,
  Table,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript'

@ObjectType()
@Table({ tableName: 'airline', timestamps: true })
export class Airline extends BaseEntity<Airline> {
  @Field()
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name: string

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: false })
  userId: string

  @Field(() => Location)
  @HasOne(() => Location, { onDelete: 'SET NULL' })
  location: Location

  @Field(() => [Flight], { nullable: true })
  @HasMany(() => Flight, { onDelete: 'SET NULL' })
  flights: Flight[]

  @Field(() => User)
  @BelongsTo(() => User, 'userId')
  user: User
}
