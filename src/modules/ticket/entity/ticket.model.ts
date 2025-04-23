import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { TicketStatus } from 'src/common/constant/enum.constant'
import { Baggage } from 'src/modules/baggage/entity/baggage.model'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { Seat } from 'src/modules/seat/entity/seat.model'
import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasOne,
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
  @ForeignKey(() => Seat)
  @Column
  seatId: string

  @Field(() => TicketStatus)
  @Default(TicketStatus.PENDING_PAYMENT)
  @Column(DataType.ENUM(...Object.values(TicketStatus)))
  status: TicketStatus

  @HasOne(() => Baggage, { onDelete: 'SET NULL' })
  baggage: Baggage

  @BelongsTo(() => Passenger, { onDelete: 'CASCADE' })
  passenger: Passenger

  @BelongsTo(() => Seat, { onDelete: 'CASCADE' })
  seat: Seat
}
