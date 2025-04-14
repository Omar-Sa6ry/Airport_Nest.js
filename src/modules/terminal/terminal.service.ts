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
  TerminalInput,
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

      const terminalResponse: TerminalInput = {
        ...terminal?.dataValues,
        airport: airport?.dataValues,
      }
      const relationCacheKey = `terminal:${terminal.id}`
      this.redisService.set(relationCacheKey, terminalResponse)

      this.websocketGateway.broadcast('terminalCreate', {
        terminalId: terminal.id,
      })

      return {
        data: terminalResponse,
        message: await this.i18n.t('terminal.CREATED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async findById (id: string): Promise<TerminalInputResponse> {
    const terminal = await this.terminalRepo.findOne({
      where: { id },
    })
    if (!terminal)
      throw new BadRequestException(await this.i18n.t('terminal.NOT_FOUND'))

    const airport = await this.airportRepo.findByPk(terminal.airportId)
    if (!airport) {
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
    }

    const terminalResponse: TerminalInput = {
      ...terminal.dataValues,
      airport: airport.dataValues,
    }
    const userCacheKey = `terminal:${terminal.id}`
    this.redisService.set(userCacheKey, terminalResponse)

    return { data: terminalResponse }
  }

  async findByData (
    findTerminalDto: FindTerminalDto,
  ): Promise<TerminalInputResponse> {
    const terminal = await this.terminalRepo.findOne({
      where: { ...findTerminalDto },
    })
    if (!terminal)
      throw new BadRequestException(await this.i18n.t('terminal.NOT_FOUND'))

    const airport = await (
      await this.airportRepo.findByPk(terminal.airportId)
    )?.dataValues
    if (!airport) {
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
    }

    const terminalResponse: TerminalInput = {
      ...terminal.dataValues,
      airport,
    }

    const terminalCacheKey = `terminal:${terminal.id}`
    this.redisService.set(terminalCacheKey, terminalResponse)

    return { data: terminalResponse }
  }

  async findTerminalsInAirport (
    airportId: string,
    page: number = Page,
    limit: number = Limit,
  ): Promise<TerminalInputsResponse> {
    let airport: Airport
    const cachedAirport = await this.redisService.get(`airport:${airportId}`)
    if (cachedAirport instanceof Airport) {
      airport = cachedAirport
    } else {
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

    if (terminals.length === 0)
      throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUNDS'))

    const result: TerminalInputsResponse = {
      items: {
        terminals: terminals.map(terminal => terminal.dataValues),
        airport: airport?.dataValues,
      },
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    }

    return result
  }

  async update (
    updateTerminalDto: UpdateTerminalDto,
  ): Promise<TerminalInputResponse> {
    let airport: Airport
    const cachedAirport = await this.redisService.get(
      `airport:${updateTerminalDto.airportId}`,
    )
    if (cachedAirport instanceof Airport) {
      airport = cachedAirport
    } else {
      const airport = await this.airportRepo.findByPk(
        updateTerminalDto.airportId,
      )
      if (!airport) {
        throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
      }
    }

    let terminal: Terminal
    const cachedTerminal = await this.redisService.get(
      `terminal:${updateTerminalDto.id}`,
    )
    if (cachedTerminal instanceof Terminal) {
      terminal = cachedTerminal
    } else {
      terminal = await this.terminalRepo.findByPk(updateTerminalDto.id)
      if (!terminal) {
        throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUND'))
      }
    }

    const updatedTerminal = await terminal.update(updateTerminalDto)
    const terminalResponse: TerminalInput = {
      ...updatedTerminal.dataValues,
      airport: airport?.dataValues,
    }
    const terminalCacheKey = `terminal:${terminal.id}`
    this.redisService.set(terminalCacheKey, terminalResponse)

    this.websocketGateway.broadcast('terminalUpdate', {
      terminalId: terminal.id,
    })

    return {
      data: terminalResponse,
      message: await this.i18n.t('terminal.UPDATED'),
    }
  }

  async delete (id: string): Promise<TerminalInputResponse> {
    const terminal = await this.terminalRepo.findOne({
      where: { id },
    })
    if (!terminal)
      throw new BadRequestException(await this.i18n.t('terminal.NOT_FOUND'))

    terminal.destroy()
    return { message: await this.i18n.t('terminal.DELETED'), data: null }
  }
}
