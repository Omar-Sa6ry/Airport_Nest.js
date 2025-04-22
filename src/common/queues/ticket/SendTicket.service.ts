import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { UserService } from 'src/modules/users/users.service'
import { CreateTicketInput } from '../../../modules/ticket/inputs/CreateTicket.input'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { Ticket } from '../../../modules/ticket/entity/ticket.model'
import { I18nService } from 'nestjs-i18n'
import { NotificationService } from 'src/common/queues/notification/notification.service'
import { Flight } from 'src/modules/flight/entity/flight.model'
import { InjectModel } from '@nestjs/sequelize'
import { Seat } from 'src/modules/seat/entity/seat.model'
import { TicketResponse } from '../../../modules/ticket/dto/ticket.response'
import { UpdateTicketInput } from '../../../modules/ticket/inputs/UpdateTicket.input'
import { generatePDF } from './util/pdfGenerate.util'

@Injectable()
export class SendTicketService {
  constructor (
    private readonly i18n: I18nService,
    private readonly websocketGateway: WebSocketMessageGateway,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    @InjectModel(Flight) private readonly flightModel: typeof Flight,
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
    @InjectModel(Seat) private readonly seatModel: typeof Seat,
    @InjectQueue('ticketQueue') private readonly ticketQueue: Queue,
  ) {}

  async create (
    createTicketInput: CreateTicketInput,
    userId: string,
    terminal: string,
    gate: string,
  ): Promise<TicketResponse> {
    const flight = await this.flightModel.findByPk(createTicketInput.flightId)
    if (!flight)
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))

    const seat = await this.seatModel.findByPk(createTicketInput.seatId)
    if (
      !seat ||
      !seat?.dataValues?.isAvailable ||
      seat?.dataValues?.class !== createTicketInput.class ||
      seat?.flightId !== flight?.id
    ) {
      throw new NotFoundException(await this.i18n.t('seat.NOT_AVAILABLE'))
    }

    const user = await (await this.userService.findById(userId))?.data
    if (!user) throw new NotFoundException(await this.i18n.t('user.NOY_FOUND'))

    const transaction = await this.ticketModel.sequelize.transaction()
    try {
      const ticket = await this.ticketModel.create({
        ...createTicketInput,
        passengerId: user.passengerId,
        seatNumber: seat.seatNumber,
      })
      seat.update({ isAvailable: false }, { transaction })

      const pdf = await generatePDF(ticket, user, flight, terminal, gate)
      await this.sendTicketToEmail(
        user.email,
        'Ticket',
        `This is your ticket`,
        pdf,
      )

      await transaction.commit()

      this.notificationService.sendNotification(
        user.fcmToken,
        'Send Ticket',
        'Ticket is sent sucessfully for your gmail',
      )
      this.websocketGateway.broadcast('ticketCreate', {
        ticketId: ticket.dataValues.id,
      })

      return {
        data: ticket.dataValues,
        statusCode: 201,
        message: await this.i18n.t('ticket.CREATED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async update (
    id: string,
    updateTicketInput: UpdateTicketInput,
    userId: string,
    terminal: string,
    gate: string,
  ): Promise<TicketResponse> {
    const transaction = await this.ticketModel.sequelize.transaction()
    try {
      const ticket = await this.ticketModel.findByPk(id)
      if (!ticket)
        throw new NotFoundException(await this.i18n.t('ticket.NOT_FOUND'))

      await ticket.update(updateTicketInput)

      const flight = await (
        await this.flightModel.findByPk(ticket.flightId)
      )?.dataValues
      if (!flight)
        throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))

      const user = await (await this.userService.findById(userId))?.data
      if (!user)
        throw new NotFoundException(await this.i18n.t('user.NOY_FOUND'))

      await transaction.commit()

      this.notificationService.sendNotification(
        user.fcmToken,
        await this.i18n.t('ticket.SENT'),
        await this.i18n.t('ticket.CREATED'),
      )
      this.websocketGateway.broadcast('ticketCreate', {
        ticketId: ticket.id,
      })

      return {
        data: ticket.dataValues,
        message: await this.i18n.t('ticket.UDTATED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async sendTicketToEmail (
    to: string,
    subject: string,
    text: string,
    attachment?: Buffer,
  ) {
    const emailData: any = { to, subject, text }

    if (attachment) {
      emailData.attachment = attachment.toString('base64')
    }

    await this.ticketQueue.add('send-email', emailData)
    console.log(`Job added to queue to send email to ${to}`)
  }
}
