import { Op } from 'sequelize'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { I18nService } from 'nestjs-i18n'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { GateLoader } from './loader/Gate.loader'
import { CreateGateDto } from './input/CreateGate.dto'
import { RedisService } from 'src/common/redis/redis.service'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { TerminalResponse } from '../terminal/dto/Terminal.response'
import { Gate } from './entity/gate.model'
import { Terminal } from '../terminal/entity/terminal.model'
import {
  GateData,
  GateDataResponse,
  GateResponse,
  GatesResponse,
} from './dto/Gate.response'

@Injectable()
export class GateService {
  constructor (
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    private readonly gateLoader: GateLoader,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectModel(Gate) private readonly gateRepo: typeof Gate,
    @InjectModel(Terminal) private readonly terminalRepo: typeof Terminal,
  ) {}

  async create (createGateDto: CreateGateDto): Promise<GateResponse> {
    let terminal
    const cachedTerminal = await this.redisService.get(
      `terminal:${createGateDto.terminalId}`,
    )
    if (cachedTerminal instanceof TerminalResponse) {
      terminal = cachedTerminal.data
    } else {
      terminal = await this.terminalRepo.findOne({
        where: { id: createGateDto.terminalId },
      })
    }

    if (!terminal)
      throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUND'))

    const gateExists = await this.gateRepo.findOne({
      where: {
        gateNumber: createGateDto.gateNumber,
        terminalId: createGateDto.terminalId,
      },
    })
    if (gateExists)
      throw new NotFoundException(await this.i18n.t('gate.EXISTS'))

    const transaction = await this.gateRepo.sequelize.transaction()
    try {
      const gate = await this.gateRepo.create(createGateDto)
      await transaction.commit()

      this.websocketGateway.broadcast('gateCreate', {
        gateId: gate.id,
      })

      return {
        data: gate.dataValues,
        statusCode: 201,
        message: await this.i18n.t('gate.CREATED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async findById (id: string): Promise<GateDataResponse> {
    const gate = await this.gateRepo.findByPk(id, {
      include: ['terminal'],
    })

    if (!gate) throw new NotFoundException(await this.i18n.t('gate.NOT_FOUND'))

    return { data: { ...gate.dataValues, terminal: gate.terminal.dataValues } }
  }

  async findGatesInTerminal (
    terminalId: string,
    page: number = Page,
    limit: number = Limit,
  ): Promise<GatesResponse> {
    const terminal = await this.terminalRepo.findByPk(terminalId)
    if (!terminal)
      throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUND'))

    const { rows: gates, count: total } = await this.gateRepo.findAndCountAll({
      where: { terminalId },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    })

    return {
      items: gates.map(g => g.dataValues),
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findGatesInAirport (airportId: string): Promise<GateData[]> {
    const terminal = await this.terminalRepo.findOne({})
    if (!terminal)
      throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUND'))

    const data = await this.terminalRepo.findAll({
      where: { airportId },
      order: [['createdAt', 'DESC']],
    })
    if (data.length !== 0) {
      const gates = await this.gateLoader.loadMany(
        data.map(terminal => terminal.id),
      )

      const items = data.map((m, index) => {
        const gate = gates[index]
        if (!gate) throw new NotFoundException(this.i18n.t('gate.NOT_FOUND'))

        return gate
      })

      return items
    }
  }

  async findAll (keys: string[]): Promise<Gate[]> {
    const gates = await this.gateRepo.findAll({
      where: { id: { [Op.in]: keys } },
      order: [['createdAt', 'DESC']],
    })
    if (!gates.length)
      throw new NotFoundException(await this.i18n.t('gate.NOT_FOUNDS'))

    return gates
  }

  async update (id: string, gateNumber: string): Promise<GateResponse> {
    const gate = await this.gateRepo.findOne({ where: { id } })
    if (!gate) throw new NotFoundException(await this.i18n.t('gate.NOT_FOUND'))

    const update = await gate.update({ gateNumber })

    return {
      data: update.dataValues,
      statusCode: 200,
      message: await this.i18n.t('gate.UPDATED'),
    }
  }

  async delete (id: string): Promise<GateResponse> {
    const gate = await this.gateRepo.findOne({ where: { id } })
    if (!gate) throw new NotFoundException(await this.i18n.t('gate.NOT_FOUND'))

    await gate.destroy()
    this.websocketGateway.broadcast('gateDelete', {
      gateId: gate.id,
    })
    return { data: null, message: await this.i18n.t('gate.DELETED') }
  }
}
