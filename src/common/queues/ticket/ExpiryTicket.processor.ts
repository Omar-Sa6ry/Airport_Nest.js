import { SendEmailService } from 'src/common/queues/email/sendemail.service'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { InjectModel } from '@nestjs/sequelize'
import { Job } from 'bullmq'
import { TicketStatus } from 'src/common/constant/enum.constant'
import { Seat } from 'src/modules/seat/entity/seat.model'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { NotificationService } from '../notification/notification.service'

@Processor('expiryticketQueue')
export class ExpiryTicketProcessor extends WorkerHost {
  constructor (
    private readonly sendEmailService: SendEmailService,
    private readonly notificationService: NotificationService,
    @InjectModel(Seat) private readonly seatModel: typeof Seat,
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
  ) {
    super()
  }
  async process (job: Job): Promise<void> {
    const { fcmToken, email, seatId } = job.data

    const seat = await this.seatModel.findByPk(seatId, { include: ['ticket'] })
    if (!seat || seat.isAvailable || !seat.ticket) return

    if (seat.ticket.dataValues.status === TicketStatus.PENDING_PAYMENT) {
      await this.ticketModel.update(
        { status: TicketStatus.EXPIRY },
        { where: { id: seat.ticket.dataValues.id } },
      )
      await seat.update({ isAvailable: true, expairyAt: null })
    }

    this.notificationService.sendNotification(
      fcmToken,
      'Expiry Ticket',
      'Ticket is Expired because you donot pay money',
    )

    this.sendEmailService.sendEmail(
      email,
      'Send Ticket',
      'Ticket is Expired because you donot pay money',
    )
  }
}
