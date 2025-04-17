import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import { Flight } from 'src/modules/flight/entity/flight.model'
import { TicketClass } from 'src/common/constant/enum.constant'
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Index,
  BelongsTo,
} from 'sequelize-typescript'
import { ulid } from 'ulid'
import { BaseEntity } from 'src/common/bases/BaseEntity'

@ObjectType()
@Table({ tableName: 'seats', timestamps: true })
export class Seat extends BaseEntity<Seat> {
  // @Field(() => ID)
  // @Column({
  //   type: DataType.STRING(26),
  //   primaryKey: true,
  //   defaultValue: () => ulid(),
  // })
  // id: string

  @Field(() => String)
  @ForeignKey(() => Flight)
  @Index({ name: 'flight_seat_unique', unique: true })
  @Column(DataType.STRING)
  flightId: string

  @Field(() => Int)
  @Index({ name: 'flight_seat_unique', unique: true })
  @Column(DataType.INTEGER)
  seatNumber: number

  @Field(() => TicketClass)
  @Column(DataType.ENUM(...Object.values(TicketClass)))
  class: TicketClass

  @Field()
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isAvailable: boolean

  @BelongsTo(() => Flight, { onDelete: 'CASCADE' })
  flight: Flight

  // @Field(() => Date)
  // @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  // createdAt: Date

  // @Field(() => Date)
  // @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  // updatedAt: Date
}
