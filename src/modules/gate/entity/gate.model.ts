import { Field, ObjectType } from '@nestjs/graphql'
import { CheckIn } from 'src/modules/checkIn/entity/checkIn.entity'
import { Terminal } from 'src/modules/terminal/entity/terminal.model'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript'

@ObjectType()
@Table({ tableName: 'gate', timestamps: true })
export class Gate extends BaseEntity<Gate> {
  @Column(DataType.STRING)
  @Field(() => String)
  gateNumber: string

  @Field(() => String)
  @ForeignKey(() => Terminal)
  @Column(DataType.STRING)
  terminalId: string

    @HasMany(() => CheckIn, { onDelete: 'SET NULL' })
    checkIns: CheckIn[]

  @BelongsTo(() => Terminal)
  terminals: Terminal
}
