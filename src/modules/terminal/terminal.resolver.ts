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
import { AllRoles, Permission, Role } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { Terminal } from './entity/terminal.model'
import { TerminalService } from './terminal.service'
import { Airport } from '../airport/entity/airport.model'
import { AirportService } from '../airport/airport.service'
import { GateService } from '../gate/gate.service'
import { Gate } from '../gate/entity/gate.model'
import { AirportResponse } from '../airport/dtos/airport.response'
import { FindTerminalDto } from './inputs/FindTerminal.dto copy'
import { CreateTerminalDto } from './inputs/CreateTerminal.dto'
import { UpdateTerminalDto } from './inputs/UpdateTerminal.dto'
import { TerminalResponse, TerminalsResponse } from './dto/Terminal.response'

@Resolver(() => Terminal)
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
  @Auth(AllRoles, [Permission.TERMINAL_VIEW])
  async terminalById (@Args('id') id: string): Promise<TerminalResponse> {
    const terminalCacheKey = `terminal:${id}`
    const cachedTerminal = await this.redisService.get(terminalCacheKey)

    if (cachedTerminal instanceof TerminalResponse) {
      return { ...cachedTerminal }
    }

    return this.terminalService.findById(id)
  }

  @Query(() => TerminalResponse)
  @Auth(AllRoles, [Permission.TERMINAL_VIEW])
  async terminalByData (
    @Args('findTerminalDto') findTerminalDto?: FindTerminalDto,
  ): Promise<TerminalResponse> {
    return this.terminalService.findByData(findTerminalDto)
  }

  @Query(() => TerminalsResponse)
  @Auth(AllRoles, [Permission.TERMINAL_VIEW])
  async allTerminalsInAirport (
    @Args('airportId') airportId: string,
  ): Promise<TerminalsResponse> {
    return this.terminalService.findTerminalsInAirport(airportId)
  }

  @ResolveField(() => Airport, { nullable: true })
  async airport (@Parent() terminal: Terminal): Promise<Airport> {
    const cacheKey = `airport:${terminal.airportId}`

    const cachedAirport = await this.redisService.get(cacheKey)
    if (cachedAirport instanceof AirportResponse) {
      return cachedAirport?.data
    }

    const airport = await this.airportService.findById(terminal.airportId)
    return airport?.data
  }

  @ResolveField(() => [Gate], { nullable: true })
  async gates (
    @Parent() terminal: Terminal,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<Gate[] | null> {
    const gates = await this.gateService.findGatesInTerminal(
      terminal.id,
      page,
      limit,
    )
    return gates.items
  }
}
