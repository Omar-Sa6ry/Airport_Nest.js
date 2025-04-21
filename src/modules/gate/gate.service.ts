import { Op } from 'sequelize'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { I18nService } from 'nestjs-i18n'
import { RedisService } from 'src/common/redis/redis.service'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { Gate } from './entity/gate.model'
import { Terminal } from '../terminal/entity/terminal.model'
import { CreateGateDto } from './dtos/createGate.dto'
import {
  GateInput,
  GateInputResponse,
  GateInputsResponse,
} from './input/Gate.input'
import { TerminalInputResponse } from '../terminal/input/Terminal.input'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { GateLoader } from './loader/Gate.loader'
import { GateOutput } from './dtos/Gate.response'

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

  async create (createGateDto: CreateGateDto): Promise<GateInputResponse> {
    let terminal
    const cachedTerminal = await this.redisService.get(
      `terminal:${createGateDto.terminalId}`,
    )
    if (cachedTerminal instanceof TerminalInputResponse) {
      terminal = cachedTerminal.data
    } else {
      terminal = await this.terminalRepo.findOne({
        where: { id: createGateDto.terminalId },
      })
      if (!terminal)
        throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUND'))
    }

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

      const gateInputResponse: GateInputResponse = {
        data: { ...gate.dataValues, terminal },
      }

      this.redisService.set(`gate:${gate.id}`, gateInputResponse)
      this.websocketGateway.broadcast('gateCreate', {
        gateId: gate.id,
      })

      return {
        data: gateInputResponse.data,
        statusCode: 201,
        message: await this.i18n.t('gate.CREATED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async findById (id: string): Promise<GateInputResponse> {
    const gate = await this.gateRepo.findOne({ where: { id } })
    if (!gate) throw new NotFoundException(await this.i18n.t('gate.NOT_FOUND'))

    const terminal = await this.terminalRepo.findOne({
      where: { id: gate.terminalId },
    })
    if (!terminal)
      throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUND'))

    const gateInputResponse: GateInputResponse = {
      data: { ...gate.dataValues, terminal: terminal.dataValues },
    }

    this.redisService.set(`gate:${gate.id}`, gateInputResponse)

    return gateInputResponse
  }

  async findGatesInTerminal (
    terminalId: string,
    page: number = Page,
    limit: number = Limit,
  ): Promise<GateInputsResponse> {
    const terminal = await this.terminalRepo.findOne({})
    if (!terminal)
      throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUND'))

    const { rows: gates, count: total } = await this.gateRepo.findAndCountAll({
      where: { terminalId },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    })
    if (!gates.length)
      throw new NotFoundException(await this.i18n.t('gate.NOT_FOUNDS'))

    const gatesInputResponse: GateInputsResponse = {
      items: { gates, terminal },
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    }

    return gatesInputResponse
  }

  async findGatesInAirport (airportId: string): Promise<GateOutput[]> {
    const terminal = await this.terminalRepo.findOne({})
    if (!terminal)
      throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUND'))

    const data = await this.terminalRepo.findAll({
      where: { airportId },
      order: [['createdAt', 'DESC']],
    })
    if (data.length === 0)
      throw new NotFoundException(await this.i18n.t('gate.NOT_FOUNDS'))

    const gates = await this.gateLoader.loadMany(
      data.map(terminal => terminal.id),
    )

    const items: GateInput[] = data.map((m, index) => {
      const gate = gates[index]
      if (!gate) throw new NotFoundException(this.i18n.t('gate.NOT_FOUND'))

      return gate
    })

    return items
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

  async update (id: string, gateNumber: string): Promise<GateInputResponse> {
    const gate = await this.gateRepo.findOne({ where: { id } })
    if (!gate) throw new NotFoundException(await this.i18n.t('gate.NOT_FOUND'))

    const updatedGate = await gate.update({ gateNumber })
    const terminal = await this.terminalRepo.findOne({
      where: { id: gate.terminalId },
    })
    if (!terminal)
      throw new NotFoundException(await this.i18n.t('terminal.NOT_FOUND'))

    const gateInputResponse: GateInputResponse = {
      data: { ...updatedGate.dataValues, terminal },
    }

    this.redisService.set(`gate:${updatedGate.id}`, gateInputResponse)

    return {
      data: gateInputResponse.data,
      statusCode: 200,
      message: await this.i18n.t('gate.UPDATED'),
    }
  }

  async delete (id: string): Promise<GateInputResponse> {
    const gate = await this.gateRepo.findOne({ where: { id } })
    if (!gate) throw new NotFoundException(await this.i18n.t('gate.NOT_FOUND'))

    await gate.destroy()
    this.redisService.del(`gate:${gate.id}`)
    this.websocketGateway.broadcast('gateDelete', {
      gateId: gate.id,
    })
    return { data: null, message: await this.i18n.t('gate.DELETED') }
  }
}
