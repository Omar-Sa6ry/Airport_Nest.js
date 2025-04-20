import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GateService } from './gate.service'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { CreateGateDto } from './dtos/createGate.dto'
import { GateResponse, GatesResponse } from './dtos/Gate.response'
import { GateInputResponse } from './input/Gate.input'
import { RedisService } from 'src/common/redis/redis.service'

@Resolver()
export class GateResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly gateService: GateService,
  ) {}

  @Mutation(() => GateResponse)
  @Auth([Role.ADMIN, Role.MANAGER], [Permission.GATE_CREATE])
  async createGate (
    @Args('createGateDto') createGateDto: CreateGateDto,
  ): Promise<GateResponse> {
    return this.gateService.create(createGateDto)
  }

  @Query(() => GateResponse)
  async gateById (@Args('id') id: string): Promise<GateResponse> {
    const cachedGate = await this.redisService.get(`gate:${id}`)
    if (cachedGate instanceof GateInputResponse) {
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
}
