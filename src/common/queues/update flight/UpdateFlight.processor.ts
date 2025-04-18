import { Op } from 'sequelize'
import { Job } from 'bullmq'
import { InjectModel } from '@nestjs/sequelize'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { User } from 'src/modules/users/entities/user.entity'
import { I18nService } from 'nestjs-i18n'
import { SendEmailService } from 'src/common/queues/email/sendemail.service'
import { NotificationService } from 'src/common/queues/notification/notification.service'
import { Processor, WorkerHost } from '@nestjs/bullmq'

@Processor('updateFlight')
export class UpdateFlightProcessor extends WorkerHost {
  constructor (
    @InjectModel(Ticket) private ticketRepo: typeof Ticket,
    @InjectModel(Passenger) private passengerRepo: typeof Passenger,
    @InjectModel(User) private userRepo: typeof User,
    private readonly i18n: I18nService,
    private readonly notificationService: NotificationService,
    private readonly sendEmailService: SendEmailService,
  ) {
    super()
  }

  async process (
    job: Job<{ ticketIds: string[]; updateFlightInput: string }>,
  ): Promise<void> {
    const { ticketIds, updateFlightInput } = job.data

    const tickets = await this.ticketRepo.findAll({
      where: { id: { [Op.in]: ticketIds } },
    })

    const passengerIds = [...new Set(tickets.map(t => t.passengerId))]
    const passengers = await this.passengerRepo.findAll({
      where: { id: { [Op.in]: passengerIds } },
    })
    const passengerMap = new Map(passengers.map(p => [p.id, p]))

    const userIds = [...new Set(passengers.map(p => p.userId))]
    const users = await this.userRepo.findAll({
      where: { id: { [Op.in]: userIds } },
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    for (const ticket of tickets) {
      const passenger = passengerMap.get(ticket.passengerId)
      if (!passenger) {
        throw new Error(await this.i18n.t('passenger.NOT_FOUND'))
      }

      const user = userMap.get(passenger.userId)
      if (!user) {
        throw new Error(await this.i18n.t('user.NOT_FOUND'))
      }

      this.notificationService.sendNotification(
        user.fcmToken,
        'Updates in your flight',
        updateFlightInput,
      )

      this.sendEmailService.sendEmail(
        user.email,
        'Flight Update Notification',
        updateFlightInput,
      )
    }
  }
}
