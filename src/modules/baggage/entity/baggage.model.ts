import { Field, Int, ObjectType } from '@nestjs/graphql'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import {
  Column,
  DataType,
  ForeignKey,
  Table,
  BelongsTo,
} from 'sequelize-typescript'

@ObjectType()
@Table({ tableName: 'baggage', timestamps: true })
export class Baggage extends BaseEntity<Baggage> {
  @Field(() => Int)
  @Column({ type: DataType.INTEGER, allowNull: false })
  limit: number

  @Field(() => Int)
  @Column({ type: DataType.INTEGER, allowNull: false })
  weight: number

  @ForeignKey(() => Ticket)
  @Column({ type: DataType.STRING(26), allowNull: false, onDelete: 'CASCADE' })
  ticketId: string

  @Field(() => Ticket)
  @BelongsTo(() => Ticket, { onDelete: 'CASCADE' })
  ticket: Ticket
}
