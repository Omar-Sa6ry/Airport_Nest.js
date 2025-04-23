import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Baggage } from './entity/baggage.model'
import { Ticket } from '../ticket/entity/ticket.model'
import { I18nService } from 'nestjs-i18n'
import { CreateBaggageInput } from './inputs/CreateBaggage.input'
import { BaggageResponse, BaggagesResponse } from './dto/Baggage.response'
import { UpdateBaggageInput } from './inputs/UpdateBaggage.input'
import { Flight } from '../flight/entity/flight.model'
import { Op } from 'sequelize'
import { BaggageLoader } from './loader/baggage.loader'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { Passenger } from '../users/entities/passenger.model'
import { Seat } from '../seat/entity/seat.model'

@Injectable()
export class BaggageService {
  constructor (
    private readonly i18n: I18nService,
    private readonly baggageLoader: BaggageLoader,
    @InjectModel(Baggage) private readonly baggageModel: typeof Baggage,
    @InjectModel(Flight) private readonly flightModel: typeof Flight,
    @InjectModel(Passenger) private readonly passengerModel: typeof Passenger,
    @InjectModel(Seat) private readonly seatModel: typeof Seat,
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
  ) {}

  async create (
    createBaggageInput: CreateBaggageInput,
  ): Promise<BaggageResponse> {
    const ticket = await this.ticketModel.findByPk(createBaggageInput.ticketId)
    if (!ticket)
      throw new NotFoundException(await this.i18n.translate('ticket.NOT_FOUND'))

    const baggage = await this.baggageModel.create(createBaggageInput)
    return {
      data: { ...baggage.dataValues, ticket: ticket.dataValues },
      statusCode: 201,
      message: await this.i18n.translate('baggage.CREATED'),
    }
  }

  async findById (id: string): Promise<BaggageResponse> {
    const baggage = await this.baggageModel.findByPk(id, {
      include: ['ticket'],
    })
    if (!baggage) {
      throw new NotFoundException(
        await this.i18n.translate('baggage.NOT_FOUND'),
      )
    }

    return {
      data: { ...baggage.dataValues, ticket: baggage.ticket.dataValues },
    }
  }

  async findByTicketId (ticketId: string): Promise<Baggage> {
    const baggage = await this.baggageModel.findOne({ where: { ticketId } })
    if (!baggage) {
      throw new NotFoundException(
        await this.i18n.translate('baggage.NOT_FOUND'),
      )
    }

    return baggage.dataValues
  }

  async findAllBaggageOnFlight (
    flightId: string,
    page: number = Page,
    limit: number = Limit,
  ): Promise<BaggagesResponse> {
    const flight = await this.flightModel.findByPk(flightId)
    if (!flight)
      throw new NotFoundException(await this.i18n.translate('flight.NOT_FOUND'))

    const seats = await this.seatModel.findAll({
      where: { flightId: flight.id },
    })
    const seatsId = [...new Set(seats.map(seat => seat.id))]

    const { rows: data, count: total } = await this.ticketModel.findAndCountAll(
      {
        where: {
          seatId: { [Op.in]: seatsId },
          createdAt: {
            [Op.gt]: flight.createdAt,
          },
        },
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit,
      },
    )

    if (data.length === 0)
      throw new NotFoundException(await this.i18n.t('baggages.NOT_FOUNDS'))

    const baggages = await this.baggageLoader.loadMany(
      data.map(baggage => baggage.id),
    )

    const items = data.map((m, index) => {
      const baggage = baggages[index]
      if (!baggage)
        throw new NotFoundException(this.i18n.t('baggage.NOT_FOUND'))

      return baggage
    })

    return {
      items,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async update (
    id: string,
    userId: string,
    updateBaggageInput: UpdateBaggageInput,
  ): Promise<BaggageResponse> {
    const baggage = await this.baggageModel.findByPk(id, {
      include: ['ticket'],
    })
    if (!baggage) {
      throw new NotFoundException(
        await this.i18n.translate('baggage.NOT_FOUND'),
      )
    }

    const passenger = await this.passengerModel.findOne({ where: { userId } })
    if (!passenger)
      throw new NotFoundException(
        await this.i18n.translate('passenger.NOT_FOUND'),
      )

    if (baggage.ticket.dataValues.passengerId === passenger.id)
      throw new BadRequestException(
        await this.i18n.translate('baggage.NOT_AUTHORIZED'),
      )

    await baggage.update(updateBaggageInput)
    return {
      data: { ...baggage.dataValues, ticket: baggage.ticket.dataValues },
      message: await this.i18n.translate('baggage.UPDATED'),
    }
  }

  async delete (id: string): Promise<BaggageResponse> {
    const baggage = await this.baggageModel.findByPk(id)
    if (!baggage) {
      throw new NotFoundException(
        await this.i18n.translate('baggage.NOT_FOUND'),
      )
    }

    await baggage.destroy()
    return {
      data: null,
      message: await this.i18n.translate('baggage.DELETED'),
    }
  }
}
