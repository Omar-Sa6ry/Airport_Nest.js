import { ObjectType, Field } from '@nestjs/graphql'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import {
  Column,
  Table,
  BelongsTo,
  ForeignKey,
  DataType,
  HasMany,
} from 'sequelize-typescript'
import { Gate } from 'src/modules/gate/entity/gate.model'

@ObjectType()
@Table({
  tableName: 'terminal',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'airportId'],
    },
  ],
})
export class Terminal extends BaseEntity<Terminal> {
  @Field(() => String)
  @Column({ type: DataType.STRING(10), allowNull: false })
  name: string

  @Field(() => Airport)
  @ForeignKey(() => Airport)
  @Column({ type: DataType.STRING(26), allowNull: false, onDelete: 'CASCADE' })
  airportId: string

  @BelongsTo(() => Airport)
  airport: Airport

  @HasMany(() => Gate, { foreignKey: 'terminalId', onDelete: 'SET NULL' })
  gates: Gate
}
