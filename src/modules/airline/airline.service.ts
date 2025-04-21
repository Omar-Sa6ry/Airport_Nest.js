import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Airline } from './entity/airline.model'
import { InjectModel } from '@nestjs/sequelize'
import { I18nService } from 'nestjs-i18n'
import { User } from '../users/entities/user.entity'
import { AirlineResponse, AirlinesResponse } from './dtos/Airline.response'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { Flight } from '../flight/entity/flight.model'
import { LocationService } from '../location/location.service'
import { CreateLocationInput } from '../location/inputs/CreateLocation.input'
import { FlightsInAirlinesResponse } from './dtos/FlightsInAirline.dto'

@Injectable()
export class AirlineService {
  constructor (
    private readonly i18n: I18nService,
    private readonly locationSerice: LocationService,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Flight) private readonly flightModel: typeof Flight,
    @InjectModel(Airline) private readonly airlineModel: typeof Airline,
  ) {}

  async create (
    userId: string,
    name: string,
    createLocationInput: CreateLocationInput,
  ): Promise<AirlineResponse> {
    const user = await this.userModel.findByPk(userId)
    if (!user) throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'))

    const existedAirline = await this.airlineModel.findOne({
      where: { userId, name },
    })
    if (existedAirline)
      throw new BadRequestException(await this.i18n.t('airline.EXISTED'))

    const airline = await this.airlineModel.create({
      name,
      userId,
    })

    this.locationSerice.create({
      ...createLocationInput,
      airlineId: airline.id,
    })

    return {
      data: airline.dataValues,
      statusCode: 201,
      message: await this.i18n.t('airline.CREATED'),
    }
  }

  async findById (id: string): Promise<AirlineResponse> {
    const airline = await this.airlineModel.findByPk(id)
    if (!airline)
      throw new NotFoundException(await this.i18n.t('airline.NOT_FOUND'))

    return { data: airline.dataValues }
  }

  async findByName (name: string): Promise<AirlineResponse> {
    const airline = await this.airlineModel.findOne({
      where: { name },
    })
    if (!airline)
      throw new NotFoundException(await this.i18n.t('airline.NOT_FOUND'))

    return { data: airline.dataValues }
  }

  async findAll (
    page: number = Page,
    limit: number = Limit,
  ): Promise<AirlinesResponse> {
    const airlines = await this.airlineModel.findAll({
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    })
    if (airlines.length == 0)
      throw new NotFoundException(await this.i18n.t('airline.NOT_FOUNDS'))

    return { items: airlines.map(a => a.dataValues) }
  }

  async findAllFlightInAirline (
    airlineId: string,
  ): Promise<FlightsInAirlinesResponse> {
    const airline = await this.airlineModel.findByPk(airlineId)
    if (!airline)
      throw new NotFoundException(await this.i18n.t('airline.NOT_FOUND'))

    const flights = await this.flightModel.findAll({
      where: { airlineId },
      order: [['createdAt', 'DESC']],
    })

    if (flights.length === 0)
      throw new NotFoundException(await this.i18n.t('flight.NOT_FOUNDS'))

    return { items: flights.map(f => f.dataValues) }
  }

  async update (
    id: string,
    name: string,
    userId: string,
  ): Promise<AirlineResponse> {
    const airline = await this.airlineModel.findOne({ where: { userId, id } })
    if (!airline)
      throw new NotFoundException(await this.i18n.t('airline.NOT_FOUND'))

    const exisitedName = await this.airlineModel.findOne({ where: { name } })
    if (exisitedName)
      throw new NotFoundException(await this.i18n.t('airline.EXIST_NAME'))

    await airline.update({ name })

    return {
      data: airline.dataValues,
      message: await this.i18n.t('airline.UPDATED'),
    }
  }

  async delete (id: string, userId: string): Promise<AirlineResponse> {
    const airline = await this.airlineModel.findOne({ where: { userId, id } })
    if (!airline)
      throw new NotFoundException(await this.i18n.t('airline.NOT_FOUND'))

    await airline.destroy()

    return { message: await this.i18n.t('airline.DELETED'), data: null }
  }
}
