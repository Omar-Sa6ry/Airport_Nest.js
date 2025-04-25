import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { SequelizeModule } from '@nestjs/sequelize'
import { SendTicketService } from './SendTicket.service'
import { TicketQueueProcessor } from './SendTicket.processor'
import { ExpiryTicketProcessor } from './ExpiryTicket.processor'
import { Seat } from 'src/modules/seat/entity/seat.model'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Gate } from 'src/modules/gate/entity/gate.model'
import { Terminal } from 'src/modules/terminal/entity/terminal.model'
import { Airline } from 'src/modules/airline/entity/airline.model'
import { Location } from 'src/modules/location/entity/location.model'
import { UserModule } from 'src/modules/users/users.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { NotificationModule } from '../notification/notification.module'
import { BaggageModule } from 'src/modules/baggage/baggage.module'
import { EmailModule } from 'src/common/queues/email/email.module'
import { SendEmailService } from '../email/sendemail.service'

@Module({
  imports: [
    SequelizeModule.forFeature([
      Ticket,
      Airline,
      Location,
      Gate,
      Terminal,
      Seat,
    ]),
    BullModule.registerQueue(
      { name: 'ticketQueue' },
      { name: 'expiryticketQueue' },
    ),
    UserModule,
    RedisModule,
    WebSocketModule,
    NotificationModule,
    BaggageModule,
    EmailModule,
  ],
  providers: [
    SendTicketService,
    SendEmailService,
    TicketQueueProcessor,
    ExpiryTicketProcessor,
  ],
  exports: [
    BullModule,
    SequelizeModule,
    RedisModule,
    WebSocketModule,
    NotificationModule,
  ],
})
export class SendTicketModule {}
