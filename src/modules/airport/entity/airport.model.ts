import {
  Table,
  Column,
  DataType,
  HasMany,
  HasOne,
  ForeignKey,
} from 'sequelize-typescript'
import { ObjectType, Field } from '@nestjs/graphql'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { Employee } from 'src/modules/employee/entity/employee.model'
import { Terminal } from 'src/modules/terminal/entity/terminal.model'
import { Flight } from 'src/modules/flight/entity/flight.model'
import { Location } from 'src/modules/location/entity/location.model'
import { Staff } from 'src/modules/flightCrew/entity/flightCrew.model'

@ObjectType()
@Table({
  tableName: 'airport',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['icaoCode', 'iataCode'],
    },
  ],
})
export class Airport extends BaseEntity<Airport> {
  @Field()
  @Column({ unique: true, type: DataType.STRING(50), allowNull: false })
  name: string

  @Field()
  @Column({ type: DataType.STRING(3), allowNull: false })
  iataCode: string

  @Field()
  @Column({ type: DataType.STRING(4), allowNull: false })
  icaoCode: string

  @HasOne(() => Location, { onDelete: 'SET NULL' })
  location: Location

  @HasMany(() => Employee, { onDelete: 'SET NULL' })
  employees: Employee[]

  @HasMany(() => Terminal, { onDelete: 'SET NULL' })
  terminals: Terminal[]

  @HasMany(() => Flight, { onDelete: 'SET NULL' })
  flights: Flight[]

  @HasMany(() => Staff, { onDelete: 'SET NULL' })
  flightCrews: Staff[]
}
