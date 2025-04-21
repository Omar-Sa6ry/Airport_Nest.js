import { FlightService } from './flight.service'
import { Flight } from './entity/flight.model'
import { CreateFlightInput } from './inputs/CreateFlight.input'
import { FlightOptinalInput } from './inputs/FlightOptinals.input'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { FlightOutput, FlightResponse } from './dtos/Flight.response'
import { FlightsFromAirportResponse } from './dtos/FlightsFromAirport.response'
import { FlightsToAirportResponse } from './dtos/FlightsToAirport.response'
import { RedisService } from 'src/common/redis/redis.service'
import { Airline } from '../airline/entity/airline.model'
import { AirlineService } from '../airline/airline.service'
import { AirportService } from '../airport/airport.service'
import { GateService } from '../gate/gate.service'
import { Airport } from '../airport/entity/airport.model'
import { GateData } from '../gate/dto/Gate.response'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql'

@Resolver(() => FlightOutput)
export class FlightResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly airlineService: AirlineService,
    private readonly airportService: AirportService,
    private readonly gateService: GateService,
    private readonly flightService: FlightService,
  ) {}

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_CREATE])
  async createFlight (
    @Args('createFlightInput') createFlightInput: CreateFlightInput,
  ): Promise<FlightResponse> {
    return this.flightService.create(createFlightInput)
  }

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_DELETE])
  async deleteFlight (@Args('id') id: string): Promise<FlightResponse> {
    return this.flightService.delete(id)
  }

  @Query(() => FlightResponse)
  async getFlightById (@Args('id') id: string): Promise<FlightResponse> {
    const cachedFlight = await this.redisService.get(`flight:${id}`)
    if (cachedFlight instanceof FlightResponse) return { ...cachedFlight }
    return this.flightService.findById(id)
  }

  @Query(() => FlightResponse)
  async getFlightByData (
    @Args('findOptions') findOptions: FlightOptinalInput,
  ): Promise<FlightResponse> {
    return this.flightService.findByData(findOptions)
  }

  @Query(() => FlightsToAirportResponse)
  async getAllFlightsToAitport (
    @Args('id') id: string,
  ): Promise<FlightsToAirportResponse> {
    return this.flightService.findAllToAirport(id)
  }

  @Query(() => FlightsFromAirportResponse)
  async getAllFlightsFromAitport (
    @Args('id') id: string,
  ): Promise<FlightsFromAirportResponse> {
    return this.flightService.findAllFromAirport(id)
  }

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_UPDATE])
  async updateFlight (
    @Args('id') id: string,
    @Args('updateFlightInput') updateFlightInput: FlightOptinalInput,
  ): Promise<FlightResponse> {
    return this.flightService.update(id, updateFlightInput)
  }

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_CHANGE_GATE])
  async changeFlightGate (
    @Args('flightId') flightId: string,
    @Args('gateId') gateId: string,
  ): Promise<FlightResponse> {
    return this.flightService.changwGate(flightId, gateId)
  }

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_CANCEL])
  async cancelFlight (@Args('id') id: string): Promise<FlightResponse> {
    return this.flightService.cancleFlight(id)
  }

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_DELAY])
  async delayFlight (
    @Args('id') id: string,
    @Args('delayTimeByMinute') delayTime: number,
  ): Promise<FlightResponse> {
    return this.flightService.delayFlight(id, delayTime)
  }

  @ResolveField(() => Airline, { nullable: true })
  async airline (@Parent() flight: Flight): Promise<Airline> {
    return (await this.airlineService.findById(flight.airlineId)).data
  }

  @ResolveField(() => Airport, { nullable: true })
  async fromAirport (@Parent() flight: Flight): Promise<Airport> {
    return (await this.airportService.findById(flight.fromAirportId)).data
  }

  @ResolveField(() => Airport, { nullable: true })
  async toAirport (@Parent() flight: Flight): Promise<Airport> {
    return (await this.airportService.findById(flight.toAirportId)).data
  }

  @ResolveField(() => GateData, { nullable: true })
  async gate (@Parent() flight: FlightOutput): Promise<GateData> {
    return (await this.gateService.findById(flight.gateId)).data
  }
}
