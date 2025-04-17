// import {
//   Column,
//   DataType,
//   ForeignKey,
//   Model,
//   Table,
// } from 'sequelize-typescript'
// import { ObjectType, Field, ID, Int } from '@nestjs/graphql'
// import { Flight } from 'src/modules/flight/entity/flight.model'
// import { Passenger } from 'src/modules/users/entities/passenger.model'
// import { TicketClass, TicketStatus } from 'src/common/constant/enum.constant'

// @ObjectType()
// @Table({ tableName: 'tickets', timestamps: true })
// export class Ticket extends Model<Ticket> {
//   @Field(() => ID)
//   @Column({ primaryKey: true, type: DataType.STRING(26) })
//   id: string

//   @Field(() => String)
//   @ForeignKey(() => Passenger)
//   @Column({ type: DataType.STRING(26), allowNull: false })
//   passengerId: string

//   @Field(() => String)
//   @ForeignKey(() => Flight)
//   @Column({ type: DataType.STRING(26), allowNull: false })
//   flightId: string

//   @Field(() => String)
//   @Column(DataType.STRING)
//   seatNumber: string

//   @Field(() => TicketClass)
//   @Column(DataType.ENUM(...Object.values(TicketClass)))
//   class: TicketClass

//   @Field(() => Int)
//   @Column(DataType.INTEGER)
//   price: number

//   @Field(() => TicketStatus)
//   @Column(DataType.ENUM(...Object.values(TicketStatus)))
//   status: TicketStatus

//   @Field(() => Date)
//   @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
//   createdAt: Date

//   @Field(() => Date)
//   @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
//   updatedAt: Date

// //   @Field(() => Gate)
// //   @BelongsTo(() => Passenger, 'gateId')
// //   gate: Gate

// //   @Field(() => Airport)
// //   @BelongsTo(() => Airport, 'fromAirportId')
// //   fromAirport: Airport
// }
