import { Field, ObjectType } from '@nestjs/graphql'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { Airline } from 'src/modules/airline/entity/airline.model'
import { Seat } from 'src/modules/seat/entity/Seat.model'
import { FlightCrew } from 'src/modules/flightCrew/entity/flightCrew.model'
import { FlightStatus } from 'src/common/constant/enum.constant'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Gate } from 'src/modules/gate/entity/gate.model'
import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript'

@ObjectType()
@Table({
  tableName: 'flight',
  indexes: [
    { name: 'idx_flight_number', fields: ['flightNumber'] },
    { name: 'idx_from_airport', fields: ['fromAirportId'] },
    { name: 'idx_to_airport', fields: ['toAirportId'] },
    { name: 'idx_gate', fields: ['gateId'] },
    { name: 'idx_status', fields: ['status'] },
  ],
})
export class Flight extends BaseEntity<Flight> {
  @Field()
  @Column({ type: DataType.STRING(20), allowNull: false })
  flightNumber: string

  @Field()
  @ForeignKey(() => Airline)
  @Column({ type: DataType.STRING(26), allowNull: false })
  airlineId: string

  @ForeignKey(() => Airport)
  @Column({ type: DataType.STRING(26), allowNull: false })
  fromAirportId: string

  @ForeignKey(() => Airport)
  @Column({ type: DataType.STRING(26), allowNull: false })
  toAirportId: string

  @ForeignKey(() => Gate)
  @Column({ type: DataType.STRING(26), allowNull: false })
  gateId: string

  @Field(() => Date)
  @Column({ type: DataType.DATE, allowNull: false })
  leaveAt: Date

  @Field(() => Date)
  @Column({ type: DataType.DATE, allowNull: false })
  arriveAt: Date

  @Field(() => FlightStatus)
  @Column({
    type: DataType.ENUM(...Object.values(FlightStatus)),
    defaultValue: FlightStatus.SCHEDULED,
  })
  status: FlightStatus

  @HasMany(() => Seat, { onDelete: 'SET NULL' })
  seats: Seat[]

  @HasMany(() => FlightCrew, { onDelete: 'SET NULL' })
  flightCrews: FlightCrew[]

  @Field(() => Gate)
  @BelongsTo(() => Gate, 'gateId')
  gate: Gate

  @Field(() => Airport)
  @BelongsTo(() => Airport, 'fromAirportId')
  fromAirport: Airport

  @Field(() => Airline)
  @BelongsTo(() => Airline, 'airlineId')
  airline: Airline

  @Field(() => Airport)
  @BelongsTo(() => Airport, 'toAirportId')
  toAirport: Airport
}
