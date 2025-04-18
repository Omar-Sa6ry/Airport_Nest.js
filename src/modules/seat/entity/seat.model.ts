import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import { Flight } from 'src/modules/flight/entity/flight.model'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { TicketClass } from 'src/common/constant/enum.constant'
import {
  Column,
  DataType,
  ForeignKey,
  Table,
  Index,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript'

@ObjectType()
@Table({ tableName: 'seats', timestamps: true })
export class Seat extends BaseEntity<Seat> {
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

  @HasOne(() => Ticket, { onDelete: 'SET NULL' })
  ticket: Ticket
}
