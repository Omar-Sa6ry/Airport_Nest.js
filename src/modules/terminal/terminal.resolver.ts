import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Permission, Role } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { Terminal } from './entity/terminal.model'
import { TerminalService } from './terminal.service'
import { TerminalResponse, TerminalsResponse } from './dtos/Terminal.response'
import { CreateTerminalDto } from './dtos/CreateTerminal.dto'
import { UpdateTerminalDto } from './dtos/UpdateTerminal.dto'
import { FindTerminalDto } from './dtos/FindTerminal.dto copy'
import { Airport } from '../airport/entity/airport.model'
import { AirportInputResponse } from '../airport/input/Airport.input'
import { AirportService } from '../airport/airport.service'
import { GateService } from '../gate/gate.service'
import { Gate } from '../gate/entity/gate.model'

@Resolver(of => Terminal)
export class TerminalResolver {
  constructor (
    private readonly redisService: RedisService,
    private terminalService: TerminalService,
    private airportService: AirportService,
    private gateService: GateService,
  ) {}

  @Mutation(() => TerminalResponse)
  @Auth([Role.ADMIN, Role.MANAGER], [Permission.TERMINAL_CREATE])
  async createTerminal (
    @Args('createTerminalDto') createTerminalDto: CreateTerminalDto,
  ): Promise<TerminalResponse> {
    return this.terminalService.create(createTerminalDto)
  }

  @Mutation(() => TerminalResponse)
  @Auth([Role.ADMIN, Role.MANAGER], [Permission.TERMINAL_UPDATE])
  async updateTerminal (
    @Args('updateTerminalDto') updateTerminalDto: UpdateTerminalDto,
  ): Promise<TerminalResponse> {
    return this.terminalService.update(updateTerminalDto)
  }

  @Mutation(() => TerminalResponse)
  @Auth([Role.ADMIN, Role.MANAGER], [Permission.TERMINAL_DELETE])
  async deleteTerminal (@Args('id') id: string): Promise<TerminalResponse> {
    return this.terminalService.delete(id)
  }

  @Query(() => TerminalResponse)
  @Auth([], [Permission.TERMINAL_VIEW])
  async terminalById (@Args('id') id: string): Promise<TerminalResponse> {
    const terminalCacheKey = `terminal:${id}`
    const cachedTerminal = await this.redisService.get(terminalCacheKey)

    if (cachedTerminal instanceof TerminalResponse) {
      return { ...cachedTerminal }
    }

    return this.terminalService.findById(id)
  }

  @Query(() => TerminalResponse)
  @Auth([], [Permission.TERMINAL_VIEW])
  async terminalByData (
    @Args('findTerminalDto') findTerminalDto?: FindTerminalDto,
  ): Promise<TerminalResponse> {
    return this.terminalService.findByData(findTerminalDto)
  }

  @Query(() => TerminalsResponse)
  @Auth([], [Permission.TERMINAL_VIEW])
  async allTerminalsInAirport (
    @Args('airportId') airportId: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<TerminalsResponse> {
    return this.terminalService.findTerminalsInAirport(airportId, page, limit)
  }

  @ResolveField(() => Airport)
  async airport (@Parent() terminal: Terminal): Promise<Airport> {
    const cacheKey = `airport:${terminal.airportId}`

    const cachedAirport = await this.redisService.get(cacheKey)
    if (cachedAirport instanceof AirportInputResponse) {
      return cachedAirport?.data?.airport
    }

    const airport = await this.airportService.findById(terminal.airportId)
    return airport?.data?.airport
  }

  @ResolveField(() => [Gate])
  async gates (
    @Parent() terminal: Terminal,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<Gate[]> {
    const gates = await this.gateService.findGatesInTerminal(
      terminal.id,
      page,
      limit,
    )
    return gates.items.gates
  }
}
