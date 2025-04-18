import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import { Flight } from 'src/modules/flight/entity/flight.model'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { TicketClass, TicketStatus } from 'src/common/constant/enum.constant'
import { CheckIn } from 'src/modules/checkIn/entity/checkIn.entity'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { Seat } from 'src/modules/seat/entity/Seat.model'
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript'

@ObjectType()
@Table({ tableName: 'ticket', timestamps: true })
export class Ticket extends BaseEntity<Ticket> {
  @Field(() => String)
  @ForeignKey(() => Passenger)
  @Column({ type: DataType.STRING(26), allowNull: false })
  passengerId: string

  @Field(() => String)
  @ForeignKey(() => Flight)
  @Column({ type: DataType.STRING(26), allowNull: false })
  flightId: string

  @Field(() => String)
  @ForeignKey(() => Seat)
  @Column
  seatId: string

  @Field(() => Int)
  @Column(DataType.INTEGER)
  seatNumber: number

  @Field(() => TicketClass)
  @Column(DataType.ENUM(...Object.values(TicketClass)))
  class: TicketClass

  @Field(() => Int)
  @Column(DataType.INTEGER)
  price: number

  @Field(() => TicketStatus)
  @Column(DataType.ENUM(...Object.values(TicketStatus)))
  status: TicketStatus

  @HasMany(() => CheckIn, { onDelete: 'CASCADE' })
  checkIns: CheckIn[]

  @BelongsTo(() => Passenger, { onDelete: 'CASCADE' })
  passenger: Passenger

  @BelongsTo(() => Seat, { onDelete: 'CASCADE' })
  seat: Seat
}
