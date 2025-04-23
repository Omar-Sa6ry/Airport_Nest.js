import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { SendTicketService } from './SendTicket.service'
import { TicketQueueProcessor } from './SendTicket.processor'
import { SendEmailService } from 'src/common/queues/email/sendemail.service'
import { EmailProcessor } from 'src/common/queues/email/email.processing'
import { RedisModule } from 'src/common/redis/redis.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { NotificationModule } from '../notification/notification.module'
import { UserModule } from 'src/modules/users/users.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { Seat } from 'src/modules/seat/entity/seat.model'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Gate } from 'src/modules/gate/entity/gate.model'
import { Terminal } from 'src/modules/terminal/entity/terminal.model'
import { Airline } from 'src/modules/airline/entity/airline.model'
import { Location } from 'src/modules/location/entity/location.model'
import { BaggageModule } from 'src/modules/baggage/baggage.module'
import { ExpiryTicketProcessor } from './ExpiryTicket.processor'

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
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),
    BullModule.registerQueue({ name: 'ticketQueue' }),
    BullModule.registerQueue({ name: 'expiryticketQueue' }),
    BullModule.registerQueue({ name: 'email' }),

    UserModule,
    BaggageModule,
    RedisModule,
    WebSocketModule,
    NotificationModule,
  ],
  providers: [
    SendTicketService,
    ExpiryTicketProcessor,
    TicketQueueProcessor,
    SendEmailService,
    EmailProcessor,
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
