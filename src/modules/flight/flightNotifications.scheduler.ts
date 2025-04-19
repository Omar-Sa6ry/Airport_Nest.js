import { Op } from 'sequelize'
import { Injectable } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { InjectModel } from '@nestjs/sequelize'
import { NotificationService } from 'src/common/queues/notification/notification.service'
import { Passenger } from '../users/entities/passenger.model'
import { User } from '../users/entities/user.entity'

@Injectable()
export class FlightNotificationScheduler {
  constructor (
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly notificationService: NotificationService,
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Passenger) private readonly passengerModel: typeof Passenger,
  ) {}

  scheduleNotification (flightId: string, leaveAt: Date) {
    const notifyTime = new Date(leaveAt.getTime() - 60 * 60 * 1000)

    const job = new CronJob(notifyTime, async () => {
      const tickets = await this.ticketModel.findAll({
        where: {
          flightId,
        },
      })

      const passengersId = tickets.map(t => t.dataValues.passengerId)
      const passengers = await this.passengerModel.findAll({
        where: { id: { [Op.in]: passengersId } },
      })

      const usersId = passengers.map(p => p.dataValues.userId)
      const users = await this.userModel.findAll({
        where: { id: { [Op.in]: usersId } },
      })

      for (const user of users) {
        if (user.fcmToken) {
          await this.notificationService.sendNotification(
            user.fcmToken,
            'Alert ',
            'Your flight will depart in 1 hour. Please get ready!',
          )
        }
      }

      this.schedulerRegistry.deleteCronJob(`flight-${flightId}`)
    })

    this.schedulerRegistry.addCronJob(`flight-${flightId}`, job)
    job.start()
  }
}
