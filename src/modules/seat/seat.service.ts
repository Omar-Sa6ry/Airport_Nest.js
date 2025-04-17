import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Seat } from './entity/seat.model'
import { CreateSeatInput } from './inputs/CreateSeat.input'
import { I18nService } from 'nestjs-i18n'
import { RedisService } from 'src/common/redis/redis.service'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { UpdateSeatInput } from './inputs/UpdateSeat.input'
import { SeatResponse, SeatsResponse } from './dto/Seat.response'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { FindSeatInput } from './inputs/FindSeat.input'
import { Flight } from '../flight/entity/flight.model'

@Injectable()
export class SeatService {
  constructor (
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectModel(Seat) private seatRepo: typeof Seat,
    @InjectModel(Flight) private flightRepo: typeof Flight,
  ) {}

  async create (createSeatInput: CreateSeatInput): Promise<SeatResponse> {
    const flight = await this.flightRepo.findByPk(createSeatInput.flightId)
    if (!flight)
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))

    const existingSeat = await this.seatRepo.findOne({
      where: {
        flightId: createSeatInput.flightId,
        seatNumber: createSeatInput.seatNumber,
      },
    })
    if (existingSeat)
      throw new NotFoundException(await this.i18n.t('seat.ALREADY_EXISTS'))

    const transaction = await this.seatRepo.sequelize.transaction()
    try {
      const seat = await this.seatRepo.create(createSeatInput, {
        transaction,
      })
      await transaction.commit()

      const seatData = { data: seat?.dataValues }

      this.redisService.set(`seat:${seat.id}`, seatData)
      this.websocketGateway.broadcast('seatCreate', {
        seatId: seat.id,
      })

      return {
        data: seatData.data,
        statusCode: 201,
        message: await this.i18n.t('seat.CREATED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async findById (id: string): Promise<SeatResponse> {
    const seat = await this.seatRepo.findByPk(id)
    if (!seat) throw new NotFoundException(await this.i18n.t('seat.NOT_FOUND'))

    if (seat.isAvailable === false)
      throw new NotFoundException(await this.i18n.t('seat.NOT_AVAILABLE'))

    const seatData = { data: seat.dataValues }
    this.redisService.set(`seat:${seat.id}`, seatData)
    return seatData
  }

  async findAllAvaliableInFlight (
    findSeat: FindSeatInput,
    page: number = Page,
    limit: number = Limit,
  ): Promise<SeatsResponse> {
    const flight = await this.flightRepo.findByPk(findSeat.flightId)
    if (!flight)
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))

    const { rows: seats, count: total } = await this.seatRepo.findAndCountAll({
      where: { isAvailable: true, ...findSeat },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    })

    if (!seats.length)
      throw new NotFoundException(await this.i18n.t('seat.NOT_FOUND'))

    return {
      items: seats.map(seat => seat.dataValues),
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async bookSeat (id: string): Promise<SeatResponse> {
    const seat = await this.seatRepo.findByPk(id)
    if (!seat) throw new NotFoundException(await this.i18n.t('seat.NOT_FOUND'))
    if (!seat.isAvailable)
      throw new NotFoundException(await this.i18n.t('seat.NOT_AVAILABLE'))

    await seat.update({ isAvailable: false })
    const seatData = { data: seat.dataValues }

    this.redisService.set(`seat:${seat.id}`, seatData)
    this.websocketGateway.broadcast('seatUpdate', {
      seatId: seat.id,
    })

    return { data: seat.dataValues, message: await this.i18n.t('seat.BOOKED') }
  }

  async unBookSeat (id: string): Promise<SeatResponse> {
    const seat = await this.seatRepo.findByPk(id)
    if (!seat) throw new NotFoundException(await this.i18n.t('seat.NOT_FOUND'))
    if (seat.isAvailable)
      throw new NotFoundException(await this.i18n.t('seat.AVAILABLE'))

    await seat.update({ isAvailable: true })
    const seatData = { data: seat.dataValues }

    this.redisService.set(`seat:${seat.id}`, seatData)
    this.websocketGateway.broadcast('seatUpdate', {
      seatId: seat.id,
    })

    return {
      data: seat.dataValues,
      message: await this.i18n.t('seat.CANCELLED'),
    }
  }

  async update (
    id: string,
    updateSeatInput: UpdateSeatInput,
  ): Promise<SeatResponse> {
    const seat = await this.seatRepo.findByPk(id)
    if (!seat) throw new NotFoundException(await this.i18n.t('seat.NOT_FOUND'))

    await seat.update(updateSeatInput)
    const seatData = { data: seat.dataValues }

    this.redisService.set(`seat:${seat.id}`, seatData)
    this.websocketGateway.broadcast('seatUpdate', {
      seatId: seat.id,
    })

    return { data: seat.dataValues, message: await this.i18n.t('seat.UPDATED') }
  }

  async delete (id: string): Promise<SeatResponse> {
    const seat = await this.seatRepo.findByPk(id)
    if (!seat) throw new NotFoundException(await this.i18n.t('seat.NOT_FOUND'))

    await seat.destroy()
    this.redisService.del(`seat:${seat.id}`)
    this.websocketGateway.broadcast('seatDelete', {
      seatId: seat.id,
    })

    return { data: null, message: await this.i18n.t('seat.DELETED') }
  }
}
