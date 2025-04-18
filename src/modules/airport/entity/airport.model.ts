import { Table, Column, DataType, HasMany } from 'sequelize-typescript'
import { ObjectType, Field } from '@nestjs/graphql'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { Employee } from 'src/modules/employee/entity/employee.model'
import { Terminal } from 'src/modules/terminal/entity/terminal.model'
import { Flight } from 'src/modules/flight/entity/flight.model'

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

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  city: string

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  country: string

  @HasMany(() => Employee, { onDelete: 'SET NULL' })
  employees: Employee[]

  @HasMany(() => Terminal, { onDelete: 'SET NULL' })
  terminals: Terminal[]

  @HasMany(() => Flight, { onDelete: 'SET NULL' })
  flights: Flight[]
}
