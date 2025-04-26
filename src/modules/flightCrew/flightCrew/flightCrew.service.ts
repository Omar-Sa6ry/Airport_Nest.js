import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Flight } from '../../flight/entity/flight.model'
import { Employee } from '../../employee/entity/employee.model'
import { Staff } from '../entity/flightCrew.model'
import { CreateFlightCrewInput } from '../inputs/CreateFlightCrew.input'
import { I18nService } from 'nestjs-i18n'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { AllRoles, CrewRole } from 'src/common/constant/enum.constant'
import { User } from '../../users/entities/user.entity'
import { SatffDataLoader } from '../loader/staff.loader'
import { StaffsResponse } from '../dtos/Staffs.response'
import { StaffResponse } from '../dtos/Staff.response'

@Injectable()
export class FlightCrewService {
  constructor (
    private readonly i18n: I18nService,
    private readonly flightCrewLoader: SatffDataLoader,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectModel(Flight) private readonly flightModel: typeof Flight,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Employee) private readonly employeeModel: typeof Employee,
    @InjectModel(Staff)
    private readonly flightCrewModel: typeof Staff,
  ) {}

  async create (
    createFlightCrewInput: CreateFlightCrewInput,
  ): Promise<StaffResponse> {
    const [flight, employee] = await Promise.all([
      this.flightModel.findByPk(createFlightCrewInput.flightId),
      this.employeeModel.findByPk(createFlightCrewInput.employeeId),
    ])

    if (!flight)
      throw new NotFoundException(await this.i18n.translate('flight.NOT_FOUND'))
    if (!employee)
      throw new NotFoundException(
        await this.i18n.translate('employee.NOT_FOUND'),
      )

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

    if (
      createFlightCrewInput.role.toString() == CrewRole.PILOT.toString() ||
      AllRoles.includes(createFlightCrewInput.role)
    ) {
      const pilots = await this.flightCrewModel.findAll({
        where: {
          role: CrewRole.PILOT,
        },
      })

      if (pilots.length === 1)
        throw new BadRequestException(
          await this.i18n.translate('flightCrew.EXISTED_PILOT'),
        )
    }

    const flightCrew = await this.flightCrewModel.create(createFlightCrewInput)

    this.websocketGateway.broadcast('flightCrewCreate', {
      flightCrewId: flightCrew.id,
    })

    return {
      data: flightCrew.dataValues,
    }
  }

  async findById (id: string): Promise<StaffResponse> {
    const flightCrew = await this.flightCrewModel.findByPk(id)
    if (!flightCrew) {
      throw new NotFoundException(
        await this.i18n.translate('flightCrew.NOT_FOUND'),
      )
    }

    return {
      data: flightCrew.dataValues,
    }
  }

  async findAllForFlight (flightId: string): Promise<StaffsResponse> {
    const flight = await this.flightModel.findByPk(flightId)
    if (!flight) {
      throw new NotFoundException(await this.i18n.translate('flight.NOT_FOUND'))
    }

    const { rows: data, count: total } =
      await this.flightCrewModel.findAndCountAll({
        where: { flightId },
        order: [['createdAt', 'DESC']],
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
    }
  }

  async delete (flightCrewId: string): Promise<StaffResponse> {
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
