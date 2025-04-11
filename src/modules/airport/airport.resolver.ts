import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { CreateAirportDto } from './dtos/CreateAirport.dto'
import { UpdateAirportDto } from './dtos/UpdateAirport.dto'
import { AirportService } from './airport.service'
import { Airport } from './entity/airport.model'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { AirportResponse, AirportsResponse } from './dtos/airport.response'

@Resolver(of => Airport)
export class AirportResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly airportService: AirportService,
  ) {}

  @Mutation(() => AirportResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async createAirport (
    @Args('createAirportDto') createAirportDto: CreateAirportDto,
  ): Promise<AirportResponse> {
    return this.airportService.create(createAirportDto)
  }

  @Mutation(() => AirportResponse)
  async updateAirport (
    @Args('id') id: string,
    @Args('updateAirportDto') updateAirportDto: UpdateAirportDto,
  ): Promise<AirportResponse> {
    return this.airportService.update(id, updateAirportDto)
  }

  @Mutation(() => AirportResponse)
  async deleteAirport (@Args('id') id: string): Promise<AirportResponse> {
    return this.airportService.delete(id)
  }

  @Query(() => AirportResponse)
  async airportById (
    @Args('id') id: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<AirportResponse> {
    const airportCacheKey = `airport:${id}`
    const cachedAirport = await this.redisService.get(airportCacheKey)

    if (cachedAirport instanceof AirportResponse) {
      return { ...cachedAirport }
    }

    return this.airportService.findById(id, page, limit)
  }

  @Query(() => AirportResponse)
  async airportByName (
    @Args('name') name: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<AirportResponse> {
    const airportCacheKey = `airport-name:${name}`
    const cachedAirport = await this.redisService.get(airportCacheKey)

    if (cachedAirport instanceof AirportResponse) {
      return { ...cachedAirport }
    }

    return this.airportService.findByName(name, page, limit)
  }

  @Query(() => AirportsResponse)
  async allAirports (
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<AirportsResponse> {
    return this.airportService.findAll(page, limit)
  }
}
