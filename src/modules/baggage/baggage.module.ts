import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Passenger } from '../users/entities/passenger.model'
import { Ticket } from '../ticket/entity/ticket.model'
import { Baggage } from './entity/baggage.model'
import { UserModule } from '../users/users.module'
import { BaggageResolver } from './baggage.resolver'
import { BaggageService } from './baggage.service'
import { BaggageLoader } from './loader/baggage.loader'
import { Flight } from '../flight/entity/flight.model'
import { Employee } from '../employee/entity/employee.model'

@Module({
  imports: [
    SequelizeModule.forFeature([Passenger, Flight, Employee, Ticket, Baggage]),
    UserModule,
  ],
  providers: [BaggageResolver, BaggageService, BaggageLoader],
  exports: [SequelizeModule, BaggageService],
})
export class BaggageModule {}
