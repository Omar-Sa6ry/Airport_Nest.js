import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { Terminal } from './entity/terminal.model'
import { TerminalService } from './terminal.service'
import { TerminalResponse, TerminalsResponse } from './dtos/Terminal.response'
import { CreateTerminalDto } from './dtos/CreateTerminal.dto'
import { UpdateTerminalDto } from './dtos/UpdateTerminal.dto'
import { FindTerminalDto } from './dtos/FindTerminal.dto copy'

@Resolver(of => Terminal)
export class TerminalResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly terminalService: TerminalService,
  ) {}

  @Mutation(() => TerminalResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async createTerminal (
    @Args('createTerminalDto') createTerminalDto: CreateTerminalDto,
  ): Promise<TerminalResponse> {
    return this.terminalService.create(createTerminalDto)
  }

  @Mutation(() => TerminalResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async updateTerminal (
    @Args('updateTerminalDto') updateTerminalDto: UpdateTerminalDto,
  ): Promise<TerminalResponse> {
    return this.terminalService.update(updateTerminalDto)
  }

  @Mutation(() => TerminalResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async deleteTerminal (@Args('id') id: string): Promise<TerminalResponse> {
    return this.terminalService.delete(id)
  }

  @Query(() => TerminalResponse)
  async terminalById (@Args('id') id: string): Promise<TerminalResponse> {
    const terminalCacheKey = `terminal:${id}`
    const cachedTerminal = await this.redisService.get(terminalCacheKey)

    if (cachedTerminal instanceof TerminalResponse) {
      return { ...cachedTerminal }
    }

    return this.terminalService.findById(id)
  }

  @Query(() => TerminalResponse)
  async terminalByData (
    @Args('findTerminalDto') findTerminalDto?: FindTerminalDto,
  ): Promise<TerminalResponse> {
    return this.terminalService.findByData(findTerminalDto)
  }

  @Query(() => TerminalsResponse)
  async allTerminalsInAirport (
    @Args('airportId') airportId: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<TerminalsResponse> {
    return this.terminalService.findTerminalsInAirport(airportId, page, limit)
  }
}
