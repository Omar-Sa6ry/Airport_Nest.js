import Stripe from 'stripe'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Gate } from 'src/modules/gate/entity/gate.model'
import { CheckIn } from './entity/checkIn.entity'
import { I18nService } from 'nestjs-i18n'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { SendTicketService } from 'src/common/queues/ticket/SendTicket.service'
import { CreateCheckInInput } from './inputs/CreateCheckIn.input'
import { CreateTicketInput } from '../ticket/inputs/CreateTicket.input'
import { GateService } from '../gate/gate.service'
import { Currency } from 'src/common/constant/enum.constant'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { CheckinResponse, CheckinsResponse } from './dtos/CheckIn.response'
import { CreateCheckinResponse } from './dtos/CreateCheckIn.respons'
import { BaggageService } from '../baggage/baggage.service'
import { CreateBagInput } from './inputs/CreateBaggage.input'

@Injectable()
export class CheckInService {
  private stripe: Stripe

  constructor (
    private readonly i18n: I18nService,
    private readonly baggageService: BaggageService,
    private readonly websocketGateway: WebSocketMessageGateway,
    private readonly sendTicketService: SendTicketService,
    private readonly gateService: GateService,
    @InjectModel(CheckIn) private readonly checkinModel: typeof CheckIn,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  async create (
    createCheckInInput: CreateCheckInInput,
    createTicketInput: CreateTicketInput,
    createBagInput: CreateBagInput,
    currency: Currency,
    userId: string,
    email: string,
  ): Promise<CreateCheckinResponse> {
    const gate = await this.gateService.findById(createCheckInInput.gateId)
    if (!gate) throw new NotFoundException('Gate not found')

    const transaction = await this.checkinModel.sequelize.transaction()
    try {
      const ticket = await this.sendTicketService.create(
        createTicketInput,
        userId,
        gate.data.terminal.name,
        gate.data.gateNumber,
      )
      const checkin = await this.checkinModel.create({
        ...createCheckInInput,
        ticketId: ticket?.data?.id,
      })

      this.baggageService.create({
        ...createBagInput,
        ticketId: ticket?.data?.id,
      })

      const lineItem = [
        {
          price_data: {
            currency,
            unit_amount: createCheckInInput.price * 100,
            product_data: {
              name: `${currency} ${createCheckInInput.price}`,
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
        customer_email: email,
      })

      const url: string = session.url
      await transaction.commit()

      this.websocketGateway.broadcast('checkInCreate', {
        checkIn: checkin.id,
      })
      return {
        data: url,
        message: await this.i18n.t('checkIn.CREATED'),
        statusCode: 201,
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async findAll (
    page: number = Page,
    limit: number = Limit,
  ): Promise<CheckinsResponse> {
    const checkIns = await this.checkinModel.findAll({
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit,
      include: [Ticket, Gate],
    })

    if (!checkIns.length)
      throw new NotFoundException(await this.i18n.t('checkIn.NOT_FOUNDS'))

    return { items: checkIns.map(c => c.dataValues) }
  }

  async findById (id: string): Promise<CheckinResponse> {
    const checkin = await this.checkinModel.findByPk(id, {
      include: [Ticket, Gate],
    })
    if (!checkin)
      throw new NotFoundException(await this.i18n.t('checkIn.NOT_FOUND'))

    return {
      data: {
        ...checkin.dataValues,
        ticket: checkin.dataValues.ticket.dataValues,
        gate: checkin.dataValues.gate.dataValues,
      },
    }
  }

  async delete (id: string): Promise<CheckinResponse> {
    const checkIn = await this.checkinModel.findByPk(id)
    if (!checkIn)
      throw new NotFoundException(await this.i18n.t('checkIn.NOT_FOUND'))

    await checkIn.destroy()

    return { data: null, message: await this.i18n.t('checkIn.DELETED') }
  }
}
