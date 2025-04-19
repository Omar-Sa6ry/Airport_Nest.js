import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Flight } from '../flight/entity/flight.model'
import { Employee } from '../employee/entity/employee.model'
import { FlightCrew } from './entity/flightCrew.model'
import { CreateFlightCrewInput } from './inputs/CreateFlightCrew.input'
import { I18nService } from 'nestjs-i18n'
import { RedisService } from 'src/common/redis/redis.service'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { CrewRole } from 'src/common/constant/enum.constant'
import { FlightCrewResponse } from './dtos/FlightCrew.response'
import { User } from '../users/entities/user.entity'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { FllghtCrewsResponse } from './dtos/FlightCrews.response'
import { FlightCrewDataLoader } from './loader/flightCrew.loader'

@Injectable()
export class FlightCrewService {
  constructor (
    private readonly i18n: I18nService,
    private readonly flightCrewLoader: FlightCrewDataLoader,
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectModel(FlightCrew)
    private readonly flightCrewModel: typeof FlightCrew,
    @InjectModel(Flight) private readonly flightModel: typeof Flight,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Employee) private readonly employeeModel: typeof Employee,
  ) {}

  async create (
    createFlightCrewInput: CreateFlightCrewInput,
  ): Promise<FlightCrewResponse> {
    const flight = await this.flightModel.findByPk(
      createFlightCrewInput.flightId,
    )
    if (!flight) {
      throw new NotFoundException(await this.i18n.translate('flight.NOT_FOUND'))
    }

    const employee = await this.employeeModel.findByPk(
      createFlightCrewInput.employeeId,
    )
    if (!employee) {
      throw new NotFoundException(
        await this.i18n.translate('employee.NOT_FOUND'),
      )
    }

    const user = await this.userModel.findByPk(employee.userId)
    if (!user)
      throw new NotFoundException(await this.i18n.translate('user.NOT_FOUND'))

    if (user.role.toString() !== createFlightCrewInput.role.toString())
      throw new BadRequestException(
        await this.i18n.translate('flightCrew.NOT_MATCH_ROLE'),
      )

    const existedCrew = await this.flightCrewModel.findOne({
      where: {
        flightId: createFlightCrewInput.flightId,
        employeeId: createFlightCrewInput.employeeId,
      },
    })
    if (existedCrew)
      throw new BadRequestException(
        await this.i18n.translate('flightCrew.EXISTED_CREW'),
      )

    const pilots = await this.flightCrewModel.findAll({
      where: {
        role: CrewRole.PILOT,
      },
    })

    if (pilots.length === 1 && createFlightCrewInput.role === CrewRole.PILOT)
      throw new BadRequestException(
        await this.i18n.translate('flightCrew.EXISTED_PILOT'),
      )

    const flightCrew = await this.flightCrewModel.create(createFlightCrewInput)

    const data = {
      ...flightCrew.dataValues,
      user: user.dataValues,
      flight: flight.dataValues,
    }

    this.redisService.set(`flightCrew${flightCrew.id}`, flightCrew)
    this.websocketGateway.broadcast('flightCrewCreate', {
      flightCrewId: flightCrew.id,
    })

    return {
      data,
    }
  }

  async findById (id: string): Promise<FlightCrewResponse> {
    const flightCrew = await this.flightCrewModel.findByPk(id, {
      include: ['flight', 'employee'],
    })
    if (!flightCrew) {
      throw new NotFoundException(
        await this.i18n.translate('flightCrew.NOT_FOUND'),
      )
    }

    const user = await this.userModel.findByPk(
      flightCrew.employee.dataValues.userId,
    )

    await this.redisService.set(`flightCrew${id}`, flightCrew)
    return {
      data: {
        ...flightCrew.dataValues,
        flight: flightCrew.flight.dataValues,
        user: user.dataValues,
      },
    }
  }

  async findAllForFlight (
    flightId: string,
    page: number = Page,
    limit: number = Limit,
  ): Promise<FllghtCrewsResponse> {
    const flight = await this.flightModel.findByPk(flightId)
    if (!flight) {
      throw new NotFoundException(await this.i18n.translate('flight.NOT_FOUND'))
    }

    const { rows: data, count: total } =
      await this.flightCrewModel.findAndCountAll({
        where: { flightId },
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit,
      })

    if (data.length === 0)
      throw new NotFoundException(await this.i18n.t('flightCrew.NOT_FOUNDS'))

    const fllghtCrewss = await this.flightCrewLoader.loadMany(
      data.map(flightCrew => flightCrew.id),
    )

    const items = data.map((m, index) => {
      const fllghtCrews = fllghtCrewss[index]
      if (!fllghtCrews)
        throw new NotFoundException(this.i18n.t('fllghtCrews.NOT_FOUND'))

      return fllghtCrews
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

  async delete (flightCrewId: string): Promise<FlightCrewResponse> {
    const flightCrew = await this.flightCrewModel.findByPk(flightCrewId)
    if (!flightCrew) {
      throw new NotFoundException(
        await this.i18n.translate('flightCrew.NOT_FOUND'),
      )
    }

    await flightCrew.destroy()

    this.websocketGateway.broadcast('flightCrewDeleted', {
      flightCrewId: flightCrew.id,
    })

    return {
      data: null,
      message: await this.i18n.translate('flightCrew.DELETED'),
    }
  }
}
