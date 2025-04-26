import { BaggageService } from './../../../modules/baggage/baggage.service'
import { CreateBaggageInput } from './../../../modules/baggage/inputs/CreateBaggage.input'
import Stripe from 'stripe'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { UserService } from 'src/modules/users/users.service'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { Ticket } from '../../../modules/ticket/entity/ticket.model'
import { I18nService } from 'nestjs-i18n'
import { NotificationService } from 'src/common/queues/notification/notification.service'
import { InjectModel } from '@nestjs/sequelize'
import { Seat } from 'src/modules/seat/entity/seat.model'
import { generatePDF } from './util/pdfGenerate.util'
import { Gate } from 'src/modules/gate/entity/gate.model'
import { Terminal } from 'src/modules/terminal/entity/terminal.model'
import { Airline } from 'src/modules/airline/entity/airline.model'
import { Location } from 'src/modules/location/entity/location.model'
import { CreateTicketResponse } from '../../../modules/ticket/dtos/CreateTicket.response'
import { PubSub } from 'graphql-subscriptions'

@Injectable()
export class SendTicketService {
  private stripe: Stripe

  constructor (
    private readonly i18n: I18nService,
    private readonly websocketGateway: WebSocketMessageGateway,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    private readonly baggageService: BaggageService,
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
    @InjectModel(Terminal) private readonly terminalModel: typeof Terminal,
    @InjectModel(Seat) private readonly seatModel: typeof Seat,
    @InjectModel(Gate) private readonly gateModel: typeof Gate,
    @InjectModel(Airline) private readonly airlineModel: typeof Airline,
    @InjectModel(Location) private readonly locationModel: typeof Location,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
    @InjectQueue('ticketQueue') private readonly ticketQueue: Queue,
    @InjectQueue('expiryticketQueue') private readonly expiryticketQueue: Queue,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  async create (
    seatId: string,
    userId: string,
    createBaggageInput: CreateBaggageInput,
  ): Promise<CreateTicketResponse> {
    const seat = await this.seatModel.findByPk(seatId, { include: ['flight'] })
    if (!seat?.isAvailable)
      throw new BadRequestException(await this.i18n.t('seat.NOT_AVAILABLE'))

    const user = await (await this.userService.findById(userId))?.data
    const gate = await this.gateModel.findByPk(seat.flight.gateId)
    const terminal = await this.terminalModel.findByPk(gate.terminalId)
    const airline = await this.airlineModel.findByPk(
      seat.flight.dataValues.airlineId,
    )
    const location = await this.locationModel.findOne({
      where: { airlineId: airline.id },
    })

    const transaction = await this.ticketModel.sequelize.transaction()
    try {
      const ticket = await this.ticketModel.create({
        seatId,
        passengerId: user.passengerId,
      })

      await seat.update(
        {
          isAvailable: false,
          expairyAt: new Date(Date.now() + 15 * 60 * 1000),
        },
        { transaction },
      )

      this.baggageService.create({ ...createBaggageInput, ticketId: ticket.id })

      this.expiryticketQueue.add(
        'expire-ticket',
        { seatId: seat.id, fcmToken: user.fcmToken, email: user.email },
        { delay: 66 * 60 * 1000 },
      )

      const lineItem = [
        {
          price_data: {
            currency: location.currency,
            unit_amount: seat.price * 100,
            product_data: {
              name: `Ticket for ${seat.seatNumber}`,
            },
          },
          quantity: 1,
        },
      ]

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItem,
        mode: 'payment',
        success_url: process.env.SUCCESSURL,
        cancel_url: process.env.FAILURL,
        client_reference_id: `${userId}`,
        customer_email: user.email,
      })

      const url: string = session.url

      await transaction.commit()

      const pdf = await generatePDF(
        ticket,
        user,
        seat.flight.dataValues,
        terminal.dataValues.name,
        gate.dataValues.gateNumber,
        seat.dataValues.class,
        airline.dataValues.name,
        seat.dataValues.seatNumber,
      )

      this.sendTicketToEmail(user.email, 'Ticket', `This is your ticket`, pdf)
      this.notificationService.sendNotification(
        user.fcmToken,
        'Send Ticket',
        'Ticket is sent sucessfully for your gmail',
      )
      this.websocketGateway.broadcast('ticketCreate', {
        ticketId: ticket.dataValues.id,
      })

      this.pubSub.publish('ticketExpired', {
        ticketExpired: {
          message: 'Ticket will be expired in 1 hour',
          seatId: seat.dataValues.id,
          id: ticket.dataValues.id,
        },
      })

      return {
        data: ticket.dataValues,
        url,
        statusCode: 201,
        message: await this.i18n.t('ticket.CREATED'),
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
