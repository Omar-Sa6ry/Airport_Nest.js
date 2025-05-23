import { Field, ObjectType } from '@nestjs/graphql'
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
  @Column(DataType.STRING(10))
  @Field(() => String)
  gateNumber: string

  @Field(() => String)
  @ForeignKey(() => Terminal)
  @Column(DataType.STRING)
  terminalId: string

  @Field(() => Terminal)
  @BelongsTo(() => Terminal)
  terminal: Terminal
}
