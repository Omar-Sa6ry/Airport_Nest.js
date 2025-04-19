import {
  Table,
  Column,
  DataType,
  ForeignKey,
  Model,
  BelongsTo,
} from 'sequelize-typescript'
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Flight } from 'src/modules/flight/entity/flight.model'
import { Employee } from 'src/modules/employee/entity/employee.model'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { CrewRole } from 'src/common/constant/enum.constant'

@ObjectType()
@Table({ tableName: 'flightCrew', timestamps: true })
export class FlightCrew extends BaseEntity<FlightCrew> {
  @Field()
  @ForeignKey(() => Flight)
  @Column({ type: DataType.STRING(26), allowNull: false })
  flightId: string

  @Field()
  @ForeignKey(() => Employee)
  @Column({ type: DataType.STRING(26), allowNull: false })
  employeeId: string

  @Field(() => CrewRole)
  @Column({
    type: DataType.ENUM(...Object.values(CrewRole)),
    allowNull: false,
  })
  role: CrewRole

  @Field(() => Flight)
  @BelongsTo(() => Flight, 'flightId')
  flight: Flight

  @Field(() => Employee)
  @BelongsTo(() => Employee, 'employeeId')
  employee: Employee
}
