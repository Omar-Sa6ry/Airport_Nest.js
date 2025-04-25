import { NotificationLoader } from './../notification/loader/notification.loader'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { SchedulerRegistry } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/sequelize'
import { Job } from 'bullmq'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { CronJob } from 'cron'
import { Op } from 'sequelize'
import { Seat } from 'src/modules/seat/entity/seat.model'
import { PubSub } from 'graphql-subscriptions'
import { Inject } from '@nestjs/common'

@Processor('schedule')
export class notifyProcessor extends WorkerHost {
  constructor (
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly notificationLoader: NotificationLoader,
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
    @InjectModel(Seat) private readonly seatModel: typeof Seat,
    @InjectModel(Passenger) private readonly passengerModel: typeof Passenger,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
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

      const userIds = [...new Set(passengers.map(p => p.userId))]

      this.notificationLoader.sendNotifications(
        userIds,
        'Alert ',
        'Your flight will depart in 1 hour. Please get ready!',
      )

      for (const userId of userIds) {
        await this.pubSub.publish('notifyUsers', {
          flightNotification: {
            message: 'Your flight will depart in 1 hour. Please get ready!',
            userId,
          },
        })
      }

      this.schedulerRegistry.deleteCronJob(`flight-${flightId}`)
    })

    job.start()
  }
}
