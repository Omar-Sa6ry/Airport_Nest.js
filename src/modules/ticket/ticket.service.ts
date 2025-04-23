import { NotificationService } from 'src/common/queues/notification/notification.service'
import { SendEmailService } from 'src/common/queues/email/sendemail.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Ticket } from './entity/ticket.model'
import { I18nService } from 'nestjs-i18n'
import { TicketResponse, TicketsResponse } from './dtos/ticket.response'
import { Op } from 'sequelize'
import { Seat } from '../seat/entity/seat.model'
import { TicketStatus } from 'src/common/constant/enum.constant'
import { User } from '../users/entities/user.entity'

@Injectable()
export class TicketService {
  constructor (
    private readonly i18n: I18nService,
    private readonly notificationService: NotificationService,
    private readonly sendEmailService: SendEmailService,
    @InjectModel(Seat) private readonly seatModel: typeof Seat,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
  ) {}

  async findAll (flightId: string): Promise<TicketsResponse> {
    const seats = await this.seatModel.findAll({
      where: { flightId },
    })
    const seatsId = [...new Set(seats.map(seat => seat.id))]

    const tickets = await this.ticketModel.findAll({
      where: { seatId: { [Op.in]: seatsId } },
      order: [['createdAt', 'DESC']],
    })
    if (tickets.length === 0)
      throw new NotFoundException(await this.i18n.t('ticket.NOT_FOUNDS'))

    return {
      items: tickets.map(t => t.dataValues),
    }
  }

  async findOne (id: string): Promise<TicketResponse> {
    const ticket = await this.ticketModel.findByPk(id)
    if (!ticket)
      throw new NotFoundException(await this.i18n.t('ticket.NOT_FOUND'))
    return { data: ticket.dataValues }
  }

  async unBook (id: string, userId: string): Promise<TicketResponse> {
    const transaction = await this.ticketModel.sequelize.transaction()
    try {
      const [user, ticket] = await Promise.all([
        this.userModel.findByPk(userId),
        this.ticketModel.findByPk(id),
      ])

      if (!ticket)
        throw new NotFoundException(await this.i18n.t('ticket.NOT_FOUND'))

      const seat = await this.seatModel.findByPk(ticket.seatId)
      if (!seat)
        throw new NotFoundException(await this.i18n.t('ticket.NOT_FOUND'))

      await ticket.update({ status: TicketStatus.CANCELED })
      await seat.update({ isAvailable: true, expairyAt: null })
      await transaction.commit()

      this.sendEmailService.sendEmail(
        user.email,
        'Ticket Cancelled',
        await this.i18n.t('ticket.CANCELED'),
      )

      this.notificationService.sendNotification(
        user.fcmToken,
        'Ticket Cancelled',
        await this.i18n.t('ticket.CANCELED'),
      )
      return { data: null, message: await this.i18n.t('ticket.CANCELED') }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async delete (id: string): Promise<TicketResponse> {
    const ticket = await this.ticketModel.findByPk(id)
    if (!ticket)
      throw new NotFoundException(await this.i18n.t('ticket.NOT_FOUND'))

    const seat = await this.seatModel.findByPk(ticket.id)
    if (seat && seat.isAvailable) {
      await seat.update({ isAvailable: true })
    }
    await ticket.destroy()
    return { data: null, message: await this.i18n.t('ticket.DELETED') }
  }

  async deleteExpiryAnDelete () {
    await this.ticketModel.destroy({
      where: {
        status: {
          [Op.in]: [TicketStatus.CANCELED, TicketStatus.EXPIRY],
        },
      },
    })

    return { data: null, message: await this.i18n.t('ticket.DELETED') }
  }
}
