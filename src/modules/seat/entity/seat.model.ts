import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import { Flight } from 'src/modules/flight/entity/flight.model'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { SeatClass, SeatPosition } from 'src/common/constant/enum.constant'
import {
  Column,
  DataType,
  ForeignKey,
  Table,
  Index,
  BelongsTo,
  HasOne,
  Default,
} from 'sequelize-typescript'

@ObjectType()
@Table({ tableName: 'seats', timestamps: true })
export class Seat extends BaseEntity<Seat> {
  @Field(() => String)
  @ForeignKey(() => Flight)
  @Index({ name: 'flight_seat_unique', unique: true })
  @Column(DataType.STRING(26))
  flightId: string

  @Field(() => Int)
  @Index({ name: 'flight_seat_unique', unique: true })
  @Column(DataType.INTEGER)
  seatNumber: number

  @Field(() => Int)
  @Column(DataType.INTEGER)
  price: number

  @Field(() => SeatClass)
  @Column(DataType.ENUM(...Object.values(SeatClass)))
  class: SeatClass

  @Field(() => SeatPosition)
  @Default(SeatPosition.AISLE)
  @Column(DataType.ENUM(...Object.values(SeatPosition)))
  position: SeatPosition

  @Field()
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isAvailable: boolean

  @Field(() => Date, { nullable: true })
  @Column({ type: DataType.DATE, allowNull: true })
  expairyAt: Date

  @BelongsTo(() => Flight, { onDelete: 'CASCADE' })
  flight: Flight

  @HasOne(() => Ticket, { onDelete: 'SET NULL' })
  ticket: Ticket
}
