import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { UpdateFlightProcessor } from './UpdateFlight.processor'
import { SequelizeModule } from '@nestjs/sequelize'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { User } from 'src/modules/users/entities/user.entity'
import { SendEmailService } from '../email/sendemail.service'
import { NotificationModule } from '../notification/notification.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { UserModule } from 'src/modules/users/users.module'
import { EmailModule } from '../email/email.module'
import { UpdateFlightService } from './UpdateFlight.service'

@Module({
  imports: [
    SequelizeModule.forFeature([Ticket, Passenger, User]),
    NotificationModule,
    EmailModule,
    UserModule,
    RedisModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'updateFlight',
    }),
    BullModule.registerQueue({
      name: 'flight-update-queue',
    }),
  ],
  providers: [UpdateFlightService, SendEmailService, UpdateFlightProcessor],
  exports: [
    BullModule,
    SequelizeModule,
    EmailModule,
    NotificationModule,
    RedisModule,
  ],
})
export class UpdateFlightModule {}
