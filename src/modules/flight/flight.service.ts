import { Op } from 'sequelize'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Flight } from './entity/flight.model'
import { RedisService } from 'src/common/redis/redis.service'
import { I18nService } from 'nestjs-i18n'
import { Gate } from '../gate/entity/gate.model'
import { FlightFromAirportLoader } from './loaders/flight.FromAirportloader'
import { ScheduleService } from 'src/common/queues/schedule/schedule.service'
import { FlightToAirportLoader } from './loaders/flight.ToAirportloader'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { FlightsFromAirportResponse } from './dtos/FlightsFromAirport.response'
import { Airline } from '../airline/entity/airline.model'
import { FlightResponse } from './dtos/Flight.response'
import { Airport } from '../airport/entity/airport.model'
import { CreateFlightInput } from './inputs/CreateFlight.input'
import { FlightOptinalInput } from './inputs/FlightOptinals.input'
import { FlightStatus } from 'src/common/constant/enum.constant'
import { TerminalService } from '../terminal/terminal.service'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { Ticket } from '../ticket/entity/ticket.model'
import { UpdateFlightService } from 'src/common/queues/update flight/UpdateFlight.service'
import {
  FlightsToAirportResponse,
  ToAirportFlightOutput,
} from './dtos/FlightsToAirport.response'

@Injectable()
export class FlightService {
  constructor (
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    private readonly scheduleService: ScheduleService,
    private readonly terminalServices: TerminalService,
    private readonly flightFromAirportLoader: FlightFromAirportLoader,
    private readonly flightToAirportLoader: FlightToAirportLoader,
    private readonly updateFlightService: UpdateFlightService,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectModel(Gate) private readonly gateRepo: typeof Gate,
    @InjectModel(Airport) private readonly airportRepo: typeof Airport,
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
    @InjectModel(Flight) private readonly flightModel: typeof Flight,
    @InjectModel(Airline) private readonly airlineModel: typeof Airline,
  ) {}

  async create (createFlightInput: CreateFlightInput): Promise<FlightResponse> {
    if (createFlightInput.fromAirportId === createFlightInput.toAirportId)
      throw new NotFoundException(await this.i18n.t('flight.SAME_AIRPORT'))

    const fromAirport = await this.airportRepo.findByPk(
      createFlightInput.fromAirportId,
    )
    if (!fromAirport)
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))

    const airline = await this.airlineModel.findByPk(
      createFlightInput.airlineId,
    )
    if (!airline)
      throw new NotFoundException(await this.i18n.t('airline.NOT_FOUND'))

    const terminals = await this.terminalServices.findTerminalsInAirport(
      createFlightInput.fromAirportId,
    )
    const terminalsId = [...new Set(terminals?.items.map(t => t.id))]

    const gate = await this.gateRepo.findByPk(createFlightInput.gateId)
    if (!gate || !terminalsId.includes(gate.terminalId))
      throw new NotFoundException(await this.i18n.t('gate.NOT_FOUND'))

    const toAirport = await this.airportRepo.findByPk(
      createFlightInput.toAirportId,
    )
    if (!toAirport)
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))

    const transaction = await this.flightModel.sequelize.transaction()
    try {
      const flight = await this.flightModel.create(createFlightInput, {
        transaction,
      })

      const flightInput: FlightResponse = { data: flight.dataValues }

      this.redisService.set(`flight:${flight.id}`, flightInput)
      this.websocketGateway.broadcast('flightCreate', {
        flightId: flight.id,
      })

      this.scheduleService.sendNotify(flight.leaveAt, flight.id)

      await transaction.commit()
      return {
        data: flightInput.data,
        message: await this.i18n.t('flight.CREATED'),
        statusCode: 201,
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async delete (id: string): Promise<FlightResponse> {
    const flight = await this.flightModel.findByPk(id)
    if (!flight) {
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))
    }

    flight.destroy()
    return { data: null, message: await this.i18n.t('flight.DELETED') }
  }

  async findById (id: string): Promise<FlightResponse> {
    const flight = await this.flightModel.findByPk(id, {
      include: ['fromAirport', 'toAirport', 'airline', 'gate'],
    })
    if (!flight) {
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))
    }

    const flightInput: FlightResponse = { data: flight.dataValues }
    this.redisService.set(`flight:${flight.id}`, flightInput)

    return flightInput
  }

  async findByData (findOptions: FlightOptinalInput): Promise<FlightResponse> {
    const flight = await this.flightModel.findOne({
      where: { ...findOptions },
      include: ['fromAirport', 'toAirport', 'airline', 'gate'],
    })

    if (!flight) {
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))
    }

    const flightInput: FlightResponse = { data: flight.dataValues }

    this.redisService.set(`flight:${flight.id}`, flightInput)

    return flightInput
  }

  async findAllFlightInAirline (airlineId: string): Promise<Flight[]> {
    const flights = await this.flightModel.findAll({ where: { airlineId } })
    if (flights.length === 0) {
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUNDS'))
    }

    return flights.map(f => f.dataValues)
  }

  async findAllFromAirport (
    fromAirportId: string,
    page: number = Page,
    limit: number = Limit,
  ): Promise<FlightsFromAirportResponse> {
    const fromAirport = await (
      await this.airportRepo.findByPk(fromAirportId)
    )?.dataValues
    if (!fromAirport)
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))

    const { rows: data, count: total } = await this.flightModel.findAndCountAll(
      {
        where: { fromAirportId },
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit,
      },
    )

    if (!data.length) {
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUNDS'))
    }

    const flights = await this.flightFromAirportLoader.loadMany(
      data.map(flight => flight.id),
    )

    const items = data.map((m, index) => {
      const flight = flights[index]
      if (!flight) throw new NotFoundException(this.i18n.t('flight.NOT_FOUND'))

      return flight
    })

    const result = {
      items,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    }

    return result
  }

  async findAllToAirport (
    toAirportId: string,
    page: number = Page,
    limit: number = Limit,
  ): Promise<FlightsToAirportResponse> {
    const toAirport = await this.airportRepo.findByPk(toAirportId)
    if (!toAirport)
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))

    const { rows: data, count: total } = await this.flightModel.findAndCountAll(
      {
        where: { toAirportId },
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit,
      },
    )

    if (!data.length) {
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUNDS'))
    }

    const flights = await this.flightToAirportLoader.loadMany(
      data.map(flight => flight.id),
    )

    const items: ToAirportFlightOutput[] = data.map((m, index) => {
      const flight = flights[index]
      if (!flight) throw new NotFoundException(this.i18n.t('flight.NOT_FOUND'))

      return flight
    })

    const result: FlightsToAirportResponse = {
      items,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    }

    return result
  }

  async update (
    id: string,
    updateFlightInput: FlightOptinalInput,
  ): Promise<FlightResponse> {
    let flight
    const cachedFlight = await this.redisService.get(`flight:${id}`)
    if (cachedFlight instanceof FlightResponse) {
      flight = cachedFlight.data
    } else {
      flight = await this.flightModel.findByPk(id, {
        include: ['fromAirport', 'toAirport', 'gate'],
      })
      if (!flight) {
        throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))
      }
    }

    const update = await flight.update(updateFlightInput)

    const flightInput: FlightResponse = {
      data: update,
    }

    const tickets = await this.ticketModel.findAll({
      where: {
        flightId: id,
        createdAt: {
          [Op.gt]: flight.createdAt,
        },
      },
    })
    this.updateFlightService.notifyTicketUsers(
      tickets.map(t => t?.dataValues?.id),
      JSON.stringify(updateFlightInput),
    )

    this.redisService.set(`flight:${flight.id}`, flightInput)
    this.websocketGateway.broadcast('flightUpdated', {
      flightId: flight.id,
    })

    return {
      data: update.dataValues,
      message: await this.i18n.t('flight.UPDATED'),
    }
  }

  async changwGate (flightId: string, gateId: string): Promise<FlightResponse> {
    const flight = await this.flightModel.findByPk(flightId, {
      include: ['fromAirport', 'toAirport', 'gate'],
    })
    if (!flight) {
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))
    }

    const terminals = await this.terminalServices.findTerminalsInAirport(
      flight.fromAirportId,
    )
    const terminalsId = [...new Set(terminals?.items.map(t => t.id))]

    const gate = await this.gateRepo.findByPk(gateId)
    if (!gate || !terminalsId.includes(gate.terminalId))
      throw new NotFoundException(await this.i18n.t('gate.NOT_FOUND'))

    const transaction = await this.flightModel.sequelize.transaction()
    try {
      flight.gateId = gateId
      flight.gate = gate
      flight.save()

      const flightInput: FlightResponse = {
        data: {
          ...flight.dataValues,
        },
      }

      const tickets = await this.ticketModel.findAll({
        where: {
          flightId: flight.id,
          createdAt: {
            [Op.gt]: flight.createdAt,
          },
        },
      })

      this.updateFlightService.notifyTicketUsers(
        tickets.map(t => t?.dataValues?.id),
        `Gate changed to ${gate.dataValues.gateNumber}`,
      )

      this.redisService.set(`flight:${flight.id}`, flightInput)
      this.websocketGateway.broadcast('flightGateUpdated', {
        flightId: flight.id,
      })

      await transaction.commit()
      return {
        data: flightInput.data,
        message: await this.i18n.t('flight.GATE_CHANGE'),
        statusCode: 201,
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async cancleFlight (id: string): Promise<FlightResponse> {
    const flight = await this.flightModel.findByPk(id, {
      include: ['fromAirport', 'toAirport', 'gate'],
    })
    if (!flight) {
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))
    }

    flight.status = FlightStatus.CANCELLED
    flight.save()

    const flightInput: FlightResponse = {
      data: {
        ...flight.dataValues,
      },
    }

    const tickets = await this.ticketModel.findAll({
      where: {
        flightId: id,
        createdAt: {
          [Op.gt]: flight.createdAt,
        },
      },
    })
    this.updateFlightService.notifyTicketUsers(
      tickets.map(t => t?.dataValues?.id),
      `Flight is cancelled ,we will return your money`,
    )

    this.redisService.set(`flight:${flight.id}`, flightInput)
    this.websocketGateway.broadcast('flightCanceled', {
      flightId: flight.id,
    })

    return {
      data: flightInput.data,
      message: await this.i18n.t('flight.CANCELED'),
    }
  }

  async delayFlight (id: string, delayTime: number): Promise<FlightResponse> {
    const flight = await this.flightModel.findByPk(id, {
      include: ['fromAirport', 'toAirport', 'gate'],
    })
    if (!flight) {
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUND'))
    }

    const transaction = await this.flightModel.sequelize.transaction()
    try {
      flight.leaveAt = new Date(flight.leaveAt.getTime() + delayTime * 60000)
      flight.arriveAt = new Date(flight.arriveAt.getTime() + delayTime * 60000)
      flight.status = FlightStatus.DELAYED
      flight.save()

      const flightInput: FlightResponse = {
        data: {
          ...flight.dataValues,
        },
      }

      const tickets = await this.ticketModel.findAll({
        where: {
          flightId: id,
          createdAt: {
            [Op.gt]: flight.createdAt,
          },
        },
      })
      this.updateFlightService.notifyTicketUsers(
        tickets.map(t => t?.dataValues?.id),
        `Flight is delayed for ${delayTime} minutes`,
      )

      this.redisService.set(`flight:${flight.id}`, flightInput)
      this.websocketGateway.broadcast('flightDelayed', {
        flightId: flight.id,
      })

      await transaction.commit()
      return {
        data: flightInput.data,
        message: await this.i18n.t('flight.DELAYED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}
