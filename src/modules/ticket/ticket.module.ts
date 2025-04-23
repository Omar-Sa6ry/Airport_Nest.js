import { forwardRef, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { UserModule } from '../users/users.module'
import { TicketResolver } from './ticket.resolver'
import { TicketService } from './ticket.service'
import { SendTicketModule } from '../../common/queues/ticket/SendTicket.module'
import { Ticket } from './entity/ticket.model'
import { SendTicketService } from 'src/common/queues/ticket/SendTicket.service'
import { Seat } from '../seat/entity/seat.model'
import { SeatService } from '../seat/seat.service'
import { AirlineModule } from '../airline/airline.module'
import { Airline } from '../airline/entity/airline.model'
import { FlightModule } from '../flight/flight.module'
import { SeatModule } from '../seat/seat.module'
import { BaggageModule } from '../baggage/baggage.module'
import { SendEmailService } from 'src/common/queues/email/sendemail.service'

@Module({
  imports: [
    SequelizeModule.forFeature([Ticket, Airline, Seat]),
    forwardRef(() => FlightModule),
    forwardRef(() => TicketModule),
    SeatModule,
    BaggageModule,
    AirlineModule,
    UserModule,
    SendTicketModule,
  ],
  providers: [
    TicketResolver,
    TicketService,
    SeatService,
    SendEmailService,
    SendTicketService,
  ],
  exports: [TicketService, SequelizeModule],
})
export class TicketModule {}
