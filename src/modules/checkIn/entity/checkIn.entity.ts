import { ObjectType, Field, Int, ID } from '@nestjs/graphql'
import {
  Column,
  DataType,
  ForeignKey,
  Table,
  BelongsTo,
} from 'sequelize-typescript'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Gate } from 'src/modules/gate/entity/gate.model'

@ObjectType()
@Table({ tableName: 'checkin', timestamps: true })
export class CheckIn extends BaseEntity<CheckIn> {
  @Field(() => String)
  @ForeignKey(() => Ticket)
  @Column({ type: DataType.STRING(26), allowNull: false })
  ticketId: string

  @Field(() => String)
  @ForeignKey(() => Gate)
  @Column({ type: DataType.STRING(26), allowNull: false })
  gateId: string

  @Field(() => Int)
  @Column({ type: DataType.INTEGER, allowNull: false })
  price: number

  @BelongsTo(() => Ticket, { onDelete: 'CASCADE' })
  ticket: Ticket

  @BelongsTo(() => Gate, { onDelete: 'CASCADE' })
  gate: Gate
}
