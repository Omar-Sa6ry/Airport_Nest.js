import { ObjectType, Field } from '@nestjs/graphql'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Staff } from 'src/modules/flightCrew/entity/flightCrew.model'
import { User } from '../../users/entities/user.entity'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import {
  Column,
  Table,
  Index,
  BelongsTo,
  ForeignKey,
  DataType,
  HasMany,
} from 'sequelize-typescript'

@ObjectType()
@Table({ tableName: 'employee', timestamps: true })
export class Employee extends BaseEntity<Employee> {
  @Field(() => String)
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: false, onDelete: 'CASCADE' })
  @Index
  userId: string

  @Field(() => Airport)
  @ForeignKey(() => Airport)
  @Column({ type: DataType.STRING(26), allowNull: false, onDelete: 'CASCADE' })
  airportId: string

  @HasMany(() => Staff, { onDelete: 'SET NULL' })
  flightCrews: Staff[]

  @HasMany(() => Staff, { onDelete: 'SET NULL' })
  airportCrews: Staff[]

  @BelongsTo(() => User)
  user: User

  @BelongsTo(() => Airport)
  airport: Airport
}
