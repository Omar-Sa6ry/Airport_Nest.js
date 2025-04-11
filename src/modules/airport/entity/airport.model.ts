import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { Employee } from 'src/modules/employee/entity/employee.model'

@ObjectType()
@Table({ tableName: 'airport', timestamps: true })
export class Airport extends BaseEntity<Airport> {
  @Field()
  @Column({ unique: true, type: DataType.STRING, allowNull: false })
  name: string

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  iataCode: string

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  icaoCode: string

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  city: string

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  country: string

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  timezone: string

  @HasMany(() => Employee, { onDelete: 'SET NULL' })
  employees: Employee[]
}
