import { I18nService } from 'nestjs-i18n'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Request } from 'express'
import Stripe from 'stripe'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { Seat } from 'src/modules/seat/entity/seat.model'
import { GateService } from 'src/modules/gate/gate.service'
import { UserService } from 'src/modules/users/users.service'
import { NotificationService } from '../queues/notification/notification.service'
import { SendTicketService } from '../queues/ticket/SendTicket.service'
import { TicketStatus } from '../constant/enum.constant'
import { generatePDF } from '../queues/ticket/util/pdfGenerate.util'
import { Airline } from 'src/modules/airline/entity/airline.model'

@Injectable()
export class StripeService {
  private stripe: Stripe

  constructor (
    private readonly i18n: I18nService,
    private readonly userService: UserService,
    private readonly gateService: GateService,
    private readonly notificationService: NotificationService,
    private readonly sendTicketService: SendTicketService,
    @InjectModel(Passenger) private passengerModel: typeof Passenger,
    @InjectModel(Ticket) private ticketModel: typeof Ticket,
    @InjectModel(Seat) private seatModel: typeof Seat,
    @InjectModel(Airline) private airlineModel: typeof Airline,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  async handleWebhook (req: Request) {
    const sig = req.headers['stripe-signature']
    let event: Stripe.Event

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      )
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message)
      throw new Error('Webhook Error: ' + err.message)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id

      const passenger = await this.passengerModel.findOne({ where: { userId } })
      const ticket = await this.ticketModel.findOne({
        where: {
          passengerId: passenger.id,
          status: TicketStatus.PENDING_PAYMENT,
        },
      })

      const [user, seat] = await Promise.all([
        this.userService.findById(userId),
        this.seatModel.findByPk(ticket.seatId, { include: ['flight'] }),
      ])
      if (!seat?.dataValues?.isAvailable) {
        throw new NotFoundException(await this.i18n.t('seat.NOT_AVAILABLE'))
      }

      await seat.update({ expairyAt: null })
      await ticket.update({ status: TicketStatus.BOOKED })
      const airline = await this.airlineModel.findByPk(seat.flight.airlineId)
      const gate = await this.gateService.findById(
        seat.flight.dataValues.gateId,
      )

      const pdf = await generatePDF(
        ticket,
        user.data,
        seat.flight.dataValues,
        gate.data.terminal.name,
        gate.data.gateNumber,
        seat.dataValues.class,
        airline.dataValues.name,
        seat.dataValues.seatNumber,
      )

      await this.sendTicketService.sendTicketToEmail(
        user.data.email,
        'Your Ticket',
        'This is your ticket PDF attached.',
        pdf,
      )

      this.notificationService.sendNotification(
        user.data.fcmToken,
        'Ticket Confirmed',
        'Your ticket has been emailed successfully.',
      )
    }

    return { received: true }
  }
}
