import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { GateService } from './gate.service'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { Terminal } from '../terminal/entity/terminal.model'
import { Gate } from './entity/gate.model'
import { TerminalService } from '../terminal/terminal.service'
import { Airport } from '../airport/entity/airport.model'
import { CreateGateDto } from './input/CreateGate.dto'
import {
  GateDataResponse,
  GateResponse,
  GatesResponse,
} from './dto/Gate.response'

@Resolver(() => Gate)
export class GateResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly gateService: GateService,
    private readonly terminalService: TerminalService,
  ) {}

  @Mutation(() => GateResponse)
  @Auth([Role.ADMIN, Role.MANAGER], [Permission.GATE_CREATE])
  async createGate (
    @Args('createGateDto') createGateDto: CreateGateDto,
  ): Promise<GateResponse> {
    return this.gateService.create(createGateDto)
  }

  @Query(() => GateDataResponse)
  async gateById (@Args('id') id: string): Promise<GateDataResponse> {
    const cachedGate = await this.redisService.get(`gate:${id}`)
    if (cachedGate instanceof GateDataResponse) {
      return cachedGate
    }

    return this.gateService.findById(id)
  }

  @Query(() => GatesResponse)
  async gatesByTerminal (
    @Args('terminalId') terminalId: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<GatesResponse> {
    return this.gateService.findGatesInTerminal(terminalId, page, limit)
  }

  @Mutation(() => GateResponse)
  @Auth([Role.ADMIN, Role.MANAGER], [Permission.GATE_UPDATE])
  async updateGate (
    @Args('id') id: string,
    @Args('gateNumber') gateNumber: string,
  ): Promise<GateResponse> {
    return this.gateService.update(id, gateNumber)
  }

  @Mutation(() => GateResponse)
  @Auth([Role.ADMIN, Role.MANAGER], [Permission.GATE_DELETE])
  async deleteGate (@Args('id') id: string): Promise<GateResponse> {
    return this.gateService.delete(id)
  }

  @ResolveField(() => Terminal)
  async terminal (@Parent() gate: Gate): Promise<Terminal> {
    return (await this.terminalService.findById(gate.terminalId)).data
  }

  @ResolveField(() => Airport)
  async airport (@Parent() gate: Gate): Promise<Airport> {
    return this.terminalService.findAirportByTerminal(gate.terminalId)
  }
}
