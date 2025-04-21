import { Op } from 'sequelize'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { CreateLocationInput } from './inputs/CreateLocation.input'
import { Location } from './entity/location.model'
import { I18nService } from 'nestjs-i18n'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { LocationResponse } from './dtos/location.response'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { AirportLocationLoader } from './loaders/airportLocation.loader'
import { AirportLocationsResponse } from './dtos/LocationsAirport.response'
import { UpdateLocationInput } from './inputs/UpdateLocation.input copy'
import { AirlineLocationsResponse } from './dtos/LocationsAirline.response'
import { AirlineLocationLoader } from './loaders/airlineLocation.loader'

@Injectable()
export class LocationService {
  constructor (
    private readonly i18n: I18nService,
    private readonly airportLocationLoader: AirportLocationLoader,
    private readonly airlineLocationLoader: AirlineLocationLoader,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectModel(Location) private readonly locationModel: typeof Location,
  ) {}

  async create (
    createLocationInput: CreateLocationInput,
  ): Promise<LocationResponse> {
    const exisitLocation = await this.locationModel.findOne({
      where: { ...createLocationInput },
    })
    if (exisitLocation)
      throw new NotFoundException(await this.i18n.t('location.EXIST'))

    const transaction = await this.locationModel.sequelize.transaction()
    try {
      const location = await this.locationModel.create(createLocationInput)
      await transaction.commit()
      this.websocketGateway.broadcast('locationCreate', {
        locationId: location.id,
      })

      return {
        data: location.dataValues,
        message: await this.i18n.t('location.CREATED'),
        statusCode: 201,
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async findById (id: string): Promise<LocationResponse> {
    const location = await this.locationModel.findByPk(id)
    if (!location)
      throw new NotFoundException(await this.i18n.t('location.NOT_FOUND'))

    return { data: location.dataValues }
  }

  async findAirportById (airportId: string): Promise<Location> {
    const location = await this.locationModel.findOne({ where: { airportId } })
    if (!location)
      throw new NotFoundException(await this.i18n.t('location.NOT_FOUND'))

    return location.dataValues
  }

  async findAllAirportsLocation (
    page: number = Page,
    limit: number = Limit,
  ): Promise<AirportLocationsResponse> {
    const { rows: data, count: total } =
      await this.locationModel.findAndCountAll({
        where: { airportId: { [Op.ne]: null } },
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit,
      })

    if (data.length === 0)
      throw new NotFoundException(await this.i18n.t('locations.NOT_FOUNDS'))

    const locations = await this.airportLocationLoader.loadMany(
      data.map(location => location.id),
    )

    const items = data.map((m, index) => {
      const location = locations[index]
      if (!location)
        throw new NotFoundException(this.i18n.t('location.NOT_FOUND'))

      return location
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

  async findAllAilinesLocation (
    page: number = Page,
    limit: number = Limit,
  ): Promise<AirlineLocationsResponse> {
    const { rows: data, count: total } =
      await this.locationModel.findAndCountAll({
        where: { airline: { [Op.ne]: null } },
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit,
      })

    if (data.length === 0)
      throw new NotFoundException(await this.i18n.t('locations.NOT_FOUNDS'))

    const locations = await this.airlineLocationLoader.loadMany(
      data.map(location => location.id),
    )

    const items = data.map((m, index) => {
      const location = locations[index]
      if (!location)
        throw new NotFoundException(this.i18n.t('location.NOT_FOUND'))

      return location
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

  async updateForUser (
    userId: string,
    updateLocationInput: UpdateLocationInput,
  ): Promise<LocationResponse> {
    const location = await this.locationModel.findOne({ where: { userId } })
    if (!location)
      throw new NotFoundException(await this.i18n.t('location.NOT_FOUND'))

    await location.update(updateLocationInput)

    return {
      data: location.dataValues,
      message: await this.i18n.t('location.UPDATED'),
    }
  }

  async updateForAirport (
    airportId: string,
    updateLocationInput: UpdateLocationInput,
  ): Promise<LocationResponse> {
    const location = await this.locationModel.findOne({ where: { airportId } })
    if (!location)
      throw new NotFoundException(await this.i18n.t('location.NOT_FOUND'))

    await location.update(updateLocationInput)

    return {
      data: location.dataValues,
      message: await this.i18n.t('location.UPDATED'),
    }
  }

  async updateForAirline (
    airlineId: string,
    updateLocationInput: UpdateLocationInput,
  ): Promise<LocationResponse> {
    const location = await this.locationModel.findOne({ where: { airlineId } })
    if (!location)
      throw new NotFoundException(await this.i18n.t('location.NOT_FOUND'))

    await location.update(updateLocationInput)

    return {
      data: location.dataValues,
      message: await this.i18n.t('location.UPDATED'),
    }
  }
}
