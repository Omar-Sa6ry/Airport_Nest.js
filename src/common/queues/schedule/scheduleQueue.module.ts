import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ScheduleProcessor } from './schedule.processing'
import { ScheduleService } from './schedule.service'
import { User } from 'src/modules/users/entities/user.entity'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { SequelizeModule } from '@nestjs/sequelize'
import { NotificationModule } from '../notification/notification.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    SequelizeModule.forFeature([User, Ticket, Passenger]),
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
  providers: [ScheduleProcessor, ScheduleService],
  exports: [BullModule, SequelizeModule],
})
export class scheduleQueueModule {}
