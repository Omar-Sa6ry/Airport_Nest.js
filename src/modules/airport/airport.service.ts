import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { I18nService } from 'nestjs-i18n'
import { RedisService } from 'src/common/redis/redis.service'
import { Airport } from './entity/airport.model'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { Limit, Page } from 'src/common/constant/messages.constant'
// import { AirportLoader } from './loader/airport.loader'
import { UpdateAirportDto } from './dtos/UpdateAirport.dto'
import { CreateAirportDto } from './dtos/CreateAirport.dto'
import {
  AirportInputResponse,
  AirportInputsResponse,
} from './input/Airport.input'

@Injectable()
export class AirportService {
  constructor (
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    // private readonly airportLoader: AirportLoader,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectModel(Airport) private airportRepo: typeof Airport,
  ) {}

  async create (
    createAirportDto: CreateAirportDto,
  ): Promise<AirportInputResponse> {
    const existingAirport = await this.airportRepo.findOne({
      where: { name: createAirportDto.name },
    })

    if (existingAirport) {
      throw new BadRequestException(
        await this.i18n.t('airport.AIRPORT_ALREADY_EXISTS'),
      )
    }

    const transaction = await this.airportRepo.sequelize.transaction()
    try {
      const airport = await this.airportRepo.create(createAirportDto, {
        transaction,
      })

      const result: AirportInputResponse = {
        data: { airport: airport },
        statusCode: 201,
        message: await this.i18n.t('airport.CREATED'),
      }

      const airportWithEmployees: AirportInputResponse = {
        data: { airport: airport?.dataValues },
      }

      const relationCacheKey = `airport:${airport.id}`
      this.redisService.set(relationCacheKey, airportWithEmployees)

      this.websocketGateway.broadcast('airportCreated', {
        airportId: airport.id,
      })

      await transaction.commit()
      return result
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async findById (airportId: string): Promise<AirportInputResponse> {
    const airport = await (
      await this.airportRepo.findByPk(airportId)
    )?.dataValues
    if (!airport) {
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
    }

    const relationCacheKey = `airport:${airport.id}`
    this.redisService.set(relationCacheKey, airport)

    return { data: { airport } }
  }

  async findByName (name: string): Promise<AirportInputResponse> {
    const airport = await (
      await this.airportRepo.findOne({ where: { name } })
    )?.dataValues
    if (!airport) {
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
    }

    const airportWithEmployees: AirportInputResponse = {
      data: { airport },
    }

    const relationCacheKey = `airport:${airport.id}`
    this.redisService.set(relationCacheKey, airportWithEmployees)

    return airportWithEmployees
  }

  async findAll (
    page: number = Page,
    limit: number = Limit,
  ): Promise<AirportInputsResponse> {
    const { rows: airports, count: total } =
      await this.airportRepo.findAndCountAll({
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit,
      })

    if (airports.length === 0)
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUNDS'))

    const result: AirportInputsResponse = {
      items: { airports },
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
    updateAirportDto: UpdateAirportDto,
  ): Promise<AirportInputResponse> {
    const transaction = await this.airportRepo.sequelize.transaction()

    try {
      const airport = await this.airportRepo.findOne({
        where: { id },
        transaction,
      })
      if (!airport) {
        throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
      }

      if (updateAirportDto?.name) {
        const existingAirport = await this.airportRepo.findOne({
          where: { name: updateAirportDto.name },
          transaction,
        })
        if (existingAirport) {
          throw new BadRequestException(
            await this.i18n.t('airport.AIRPORT_ALREADY_EXISTS'),
          )
        }
      }

      Object.assign(airport, updateAirportDto)
      await airport.save({ transaction })
      await transaction.commit()

      return {
        data: { airport },
        message: await this.i18n.t('airport.UPDATED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async delete (id: string): Promise<AirportInputResponse> {
    const airport = await this.airportRepo.findByPk(id)
    if (!(airport instanceof Airport))
      throw new BadRequestException(await this.i18n.t('airport.NOT_FOUND'))

    await airport.destroy()
    return { message: await this.i18n.t('airport.DELETED'), data: null }
  }
}
