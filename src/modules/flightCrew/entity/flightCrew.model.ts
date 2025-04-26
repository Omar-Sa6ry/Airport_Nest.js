import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { ObjectType, Field } from '@nestjs/graphql'
import { Flight } from 'src/modules/flight/entity/flight.model'
import { Employee } from 'src/modules/employee/entity/employee.model'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { CrewRole, Role } from 'src/common/constant/enum.constant'
import { Airport } from 'src/modules/airport/entity/airport.model'

@ObjectType()
@Table({ tableName: 'flightCrew', timestamps: true })
export class Staff extends BaseEntity<Staff> {
  @Field()
  @ForeignKey(() => Employee)
  @Column({ type: DataType.STRING(26), allowNull: false })
  employeeId: string

  @Field({ nullable: true })
  @ForeignKey(() => Airport)
  @Column({ type: DataType.STRING(26), allowNull: true })
  airportId: string | null

  @Field({ nullable: true })
  @ForeignKey(() => Flight)
  @Column({ type: DataType.STRING(26), allowNull: true })
  flightId: string | null

  @Field(() => CrewRole)
  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    allowNull: false,
  })
  role: Role

  @Field(() => Flight)
  @BelongsTo(() => Flight, 'flightId')
  flight: Flight

  @Field(() => Airport)
  @BelongsTo(() => Airport, 'airportId')
  airport: Airport

  @Field(() => Employee)
  @BelongsTo(() => Employee, 'employeeId')
  employee: Employee
}
