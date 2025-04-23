import { Processor, WorkerHost } from '@nestjs/bullmq'
import { SchedulerRegistry } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/sequelize'
import { Job } from 'bullmq'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { User } from 'src/modules/users/entities/user.entity'
import { NotificationService } from '../notification/notification.service'
import { CronJob } from 'cron'
import { Op } from 'sequelize'
import { Seat } from 'src/modules/seat/entity/seat.model'

@Processor('schedule')
export class ScheduleProcessor extends WorkerHost {
  constructor (
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly notificationService: NotificationService,
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Seat) private readonly seatModel: typeof Seat,
    @InjectModel(Passenger) private readonly passengerModel: typeof Passenger,
  ) {
    super()
  }

  async process (data: Job): Promise<void> {
    const { leaveAt, flightId } = data.data

    const notifyTime = new Date(leaveAt.getTime() - 60 * 60 * 1000)

    const seats = await this.seatModel.findAll({ where: { flightId } })
    const seatsId = [...new Set(seats.map(seat => seat.id))]

    const job = new CronJob(notifyTime, async () => {
      const tickets = await this.ticketModel.findAll({
        where: {
          seatId: { [Op.in]: seatsId },
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

    job.start()
  }
}
