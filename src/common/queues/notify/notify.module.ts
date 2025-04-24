import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { notifyProcessor } from './notify.processing'
import { NotifyService } from './notify.service'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { SequelizeModule } from '@nestjs/sequelize'
import { NotificationModule } from '../notification/notification.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { ScheduleModule } from '@nestjs/schedule'
import { Seat } from 'src/modules/seat/entity/seat.model'
import { NotificationLoader } from '../notification/loader/notification.loader'
import { User } from 'src/modules/users/entities/user.entity'

@Module({
  imports: [
    SequelizeModule.forFeature([Seat, User, Ticket, Passenger]),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),
    BullModule.registerQueue({ name: 'schedule' }),
    NotificationModule,
    RedisModule,
  ],
  providers: [notifyProcessor, NotificationLoader, NotifyService],
  exports: [BullModule, SequelizeModule],
})
export class NotifyModule {}
