import { Module } from '@nestjs/common'
import { StripeService } from './stripe.service'
import { StripeController } from './stripe.controller'
import { SequelizeModule } from '@nestjs/sequelize'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Seat } from 'src/modules/seat/entity/seat.model'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { UserModule } from 'src/modules/users/users.module'
import { GateModule } from 'src/modules/gate/gate.module'
import { NotificationModule } from '../queues/notification/notification.module'
import { SendTicketModule } from '../queues/ticket/sendticket.module'
import { SendTicketService } from '../queues/ticket/SendTicket.service'
import { Airline } from 'src/modules/airline/entity/airline.model'
import { BaggageModule } from 'src/modules/baggage/baggage.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Ticket, Airline, Passenger, Seat]),
    UserModule,
    GateModule,
    BaggageModule,
    NotificationModule,
    SendTicketModule,
  ],
  controllers: [StripeController],
  providers: [StripeService, SendTicketService],
})
export class StripeModule {}
