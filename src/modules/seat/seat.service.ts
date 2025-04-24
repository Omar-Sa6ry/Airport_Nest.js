import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Seat } from './entity/seat.model'
import { CreateSeatInput } from './inputs/CreateSeat.input'
import { I18nService } from 'nestjs-i18n'
import { RedisService } from 'src/common/redis/redis.service'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { UpdateSeatInput } from './inputs/UpdateSeat.input'
import { SeatResponse, SeatsResponse } from './dto/Seat.response'
import { FindSeatInput } from './inputs/FindSeat.input'
import { Flight } from '../flight/entity/flight.model'
import { Airline } from '../airline/entity/airline.model'
import { AirlineService } from '../airline/airline.service'

@Injectable()
export class SeatService {
  constructor (
    private readonly i18n: I18nService,
    private readonly airlineService: AirlineService,
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectModel(Seat) private seatRepo: typeof Seat,
    @InjectModel(Airline) private airlineRepo: typeof Airline,
    @InjectModel(Flight) private flightRepo: typeof Flight,
  ) {}

  async create (createSeatInput: CreateSeatInput): Promise<SeatResponse> {
    const [flight, existingSeat] = await Promise.all([
      this.flightRepo.findByPk(createSeatInput.flightId),
      this.seatRepo.findOne({
        where: {
          flightId: createSeatInput.flightId,
          seatNumber: createSeatInput.seatNumber,
        },
      }),
    ])

    if (!flight)
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))
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

  async findByIdWithoutError (id: string): Promise<SeatResponse> {
    const seat = await this.seatRepo.findByPk(id)
    if (!seat) throw new NotFoundException(await this.i18n.t('seat.NOT_FOUND'))

    const seatData = { data: seat.dataValues }
    this.redisService.set(`seat:${seat.id}`, seatData)
    return seatData
  }

  async findAllAvaliableInFlight (
    findSeat: FindSeatInput,
  ): Promise<SeatsResponse> {
    const flight = await this.flightRepo.findByPk(findSeat.flightId)
    if (!flight)
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))

    const seats = await this.seatRepo.findAll({
      where: { isAvailable: true, ...findSeat },
      order: [['createdAt', 'DESC']],
    })

    if (!seats.length)
      throw new NotFoundException(await this.i18n.t('seat.NOT_FOUND'))

    return {
      items: seats.map(seat => seat.dataValues),
    }
  }

  async findAllInFlight (flightId: string): Promise<SeatsResponse> {
    const flight = await this.flightRepo.findByPk(flightId)
    if (!flight)
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))

    const seats = await this.seatRepo.findAll({
      where: { flightId },
      order: [['createdAt', 'DESC']],
    })

    if (seats.length !== 0) {
      return {
        items: seats?.map(seat => seat.dataValues),
      }
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

  async makeSeatsAvaliableInFlight (
    flightId: string,
    userId: string,
  ): Promise<SeatsResponse> {
    const airline = await this.airlineRepo.findOne({ where: { userId } })
    if (!airline)
      throw new BadRequestException(await this.i18n.t('airline.NOT_OWNER'))

    const flights = (
      await this.airlineService.findAllFlightInAirline(airline.id)
    ).items
    const flightIds = [...new Set(flights.map(f => f.id))]

    if (flightIds.includes(flightId))
      throw new BadRequestException(
        await this.i18n.t('seat.NOT_HAVE_THIS_SEAT'),
      )

    const seats = await this.seatRepo.findAll({
      where: { flightId, isAvailable: false },
    })
    if (seats.length === 0)
      throw new NotFoundException(await this.i18n.t('seat.NOT_FOUNDS'))

    await seats.map(s => s.update({ isAvailable: true }))

    return {
      items: seats.map(s => s.dataValues),
      message: await this.i18n.t('seat.AVALIABLES'),
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
