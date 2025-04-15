import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { RedisService } from 'src/common/redis/redis.service'
import { FindTerminalDto } from './dtos/FindTerminal.dto copy'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { Airport } from '../airport/entity/airport.model'
import { CreateTerminalDto } from './dtos/CreateTerminal.dto'
import { UpdateTerminalDto } from './dtos/UpdateTerminal.dto'
import { InjectModel } from '@nestjs/sequelize'
import { I18nService } from 'nestjs-i18n'
import { Terminal } from './entity/terminal.model'
import {
  TerminalInputResponse,
  TerminalInputsResponse,
} from './input/Terminal.input'

@Injectable()
export class TerminalService {
  constructor (
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectModel(Airport) private airportRepo: typeof Airport,
    @InjectModel(Terminal) private terminalRepo: typeof Terminal,
  ) {}

  async create (
    createTerminalDto: CreateTerminalDto,
  ): Promise<TerminalInputResponse> {
    const transaction = await this.terminalRepo.sequelize.transaction()
    try {
      const airport = await this.airportRepo.findByPk(
        createTerminalDto.airportId,
      )
      if (!airport) {
        throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
      }

      const terminal = await this.terminalRepo.create(createTerminalDto, {
        transaction,
      })

      await transaction.commit()

      this.redisService.set(`terminal:${terminal.id}`, terminal)
      this.websocketGateway.broadcast('terminalCreate', {
        terminalId: terminal.id,
      })

      return {
        data: terminal,
        statusCode: 201,
        message: await this.i18n.t('terminal.CREATED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async findById (id: string): Promise<TerminalInputResponse> {
    const terminal = await this.terminalRepo.findByPk(id)
    if (!terminal) {
      throw new BadRequestException(await this.i18n.t('terminal.NOT_FOUND'))
    }

    this.redisService.set(`terminal:${terminal.id}`, terminal)
    return { data: terminal }
  }

  async findByData (
    findTerminalDto: FindTerminalDto,
  ): Promise<TerminalInputResponse> {
    const terminal = await this.terminalRepo.findOne({
      where: { ...findTerminalDto },
    })
    if (!terminal) {
      throw new BadRequestException(await this.i18n.t('terminal.NOT_FOUND'))
    }

    this.redisService.set(`terminal:${terminal.id}`, terminal)
    return { data: terminal }
  }

  async findTerminalsInAirport (
    airportId: string,
    page: number = Page,
    limit: number = Limit,
  ): Promise<TerminalInputsResponse> {
    let airport = await this.redisService.get(`airport:${airportId}`)

    if (!(airport instanceof Airport)) {
      airport = await this.airportRepo.findByPk(airportId)
      if (!airport) {
        throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
      }
    }

    const { rows: terminals, count: total } =
      await this.terminalRepo.findAndCountAll({
        where: { airportId },
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit,
      })

    if (terminals.length === 0) {
      throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUNDS'))
    }

    return {
      items: terminals,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async update (
    updateTerminalDto: UpdateTerminalDto,
  ): Promise<TerminalInputResponse> {
    const airport = await this.airportRepo.findByPk(updateTerminalDto.airportId)
    if (!airport) {
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
    }

    let terminal = await this.terminalRepo.findByPk(updateTerminalDto.id)
    if (!terminal) {
      throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUND'))
    }

    terminal = await terminal.update(updateTerminalDto)

    this.redisService.set(`terminal:${terminal.id}`, terminal)
    this.websocketGateway.broadcast('terminalUpdate', {
      terminalId: terminal.id,
    })

    return { data: terminal }
  }

  async delete (id: string): Promise<TerminalInputResponse> {
    const terminal = await this.terminalRepo.findByPk(id)
    if (!terminal) {
      throw new BadRequestException(await this.i18n.t('terminal.NOT_FOUND'))
    }

    await terminal.destroy()

    this.redisService.del(`terminal:${terminal.id}`)
    this.websocketGateway.broadcast('terminalDelete', {
      terminalId: terminal.id,
    })
    return { data: null, message: await this.i18n.t('terminal.DELETED') }
  }
}
