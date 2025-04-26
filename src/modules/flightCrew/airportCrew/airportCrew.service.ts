import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Employee } from '../../employee/entity/employee.model'
import { I18nService } from 'nestjs-i18n'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { AllRoles, CrewRole } from 'src/common/constant/enum.constant'
import { User } from '../../users/entities/user.entity'
import { CreateAirportCrewInput } from '../inputs/CreateAirportCrew.input'
import { Airport } from '../../airport/entity/airport.model'
import { Staff } from '../entity/flightCrew.model'
import { StaffResponse } from '../dtos/Staff.response'
import { StaffsResponse } from '../dtos/Staffs.response'
import { SatffDataLoader } from '../loader/staff.loader'

@Injectable()
export class AirportCrewService {
  constructor (
    private readonly i18n: I18nService,
    private readonly airportCrewLoader: SatffDataLoader,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectModel(Airport) private readonly airportModel: typeof Airport,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Employee) private readonly employeeModel: typeof Employee,
    @InjectModel(Staff)
    private readonly airportCrewModel: typeof Staff,
  ) {}

  async create (
    createAirportCrewInput: CreateAirportCrewInput,
  ): Promise<StaffResponse> {
    const [airport, employee] = await Promise.all([
      this.airportModel.findByPk(createAirportCrewInput.airportId),
      this.employeeModel.findByPk(createAirportCrewInput.employeeId),
    ])

    if (!airport)
      throw new NotFoundException(
        await this.i18n.translate('airport.NOT_FOUND'),
      )
    if (!employee)
      throw new NotFoundException(
        await this.i18n.translate('employee.NOT_FOUND'),
      )

    const user = await this.userModel.findByPk(employee.userId)
    if (!user)
      throw new NotFoundException(await this.i18n.translate('user.NOT_FOUND'))

    if (
      user.role.toString() !== createAirportCrewInput.role.toString() ||
      AllRoles.includes(createAirportCrewInput.role)
    )
      throw new BadRequestException(
        await this.i18n.translate('airportCrew.NOT_MATCH_ROLE'),
      )

    const existedCrew = await this.airportCrewModel.findOne({
      where: {
        airportId: createAirportCrewInput.airportId,
        employeeId: createAirportCrewInput.employeeId,
      },
    })
    if (existedCrew)
      throw new BadRequestException(
        await this.i18n.translate('airportCrew.EXISTED_CREW'),
      )

    if (createAirportCrewInput.role.toString() === CrewRole.PILOT.toString()) {
      const pilots = await this.airportCrewModel.findAll({
        where: {
          role: CrewRole.PILOT,
        },
      })
    }

    const airportCrew = await this.airportCrewModel.create(
      createAirportCrewInput,
    )

    this.websocketGateway.broadcast('airportCrewCreate', {
      airportCrewId: airportCrew.id,
    })

    return {
      data: airportCrew.dataValues,
    }
  }

  async findById (id: string): Promise<StaffResponse> {
    const airportCrew = await this.airportCrewModel.findByPk(id)
    if (!airportCrew) {
      throw new NotFoundException(
        await this.i18n.translate('airportCrew.NOT_FOUND'),
      )
    }

    return {
      data: airportCrew.dataValues,
    }
  }

  async findAllForAirport (airportId: string): Promise<StaffsResponse> {
    const airport = await this.airportModel.findByPk(airportId)
    if (!airport) {
      throw new NotFoundException(
        await this.i18n.translate('airport.NOT_FOUND'),
      )
    }

    const { rows: data, count: total } =
      await this.airportCrewModel.findAndCountAll({
        where: { airportId },
        order: [['createdAt', 'DESC']],
      })

    if (data.length === 0)
      throw new NotFoundException(await this.i18n.t('airportCrew.NOT_FOUNDS'))

    const fllghtCrewss = await this.airportCrewLoader.loadMany(
      data.map(airportCrew => airportCrew.id),
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

  async delete (airportCrewId: string): Promise<StaffResponse> {
    const airportCrew = await this.airportCrewModel.findByPk(airportCrewId)
    if (!airportCrew) {
      throw new NotFoundException(
        await this.i18n.translate('airportCrew.NOT_FOUND'),
      )
    }

    await airportCrew.destroy()

    this.websocketGateway.broadcast('airportCrewDeleted', {
      airportCrewId: airportCrew.id,
    })

    return {
      data: null,
      message: await this.i18n.translate('airportCrew.DELETED'),
    }
  }
}
