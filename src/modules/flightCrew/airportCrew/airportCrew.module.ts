import { forwardRef, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from '../../users/entities/user.entity'
import { Employee } from '../../employee/entity/employee.model'
import { Flight } from '../../flight/entity/flight.model'
import { UserModule } from '../../users/users.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { AirportModule } from '../../airport/airport.module'
import { AirportCrewService } from './airportCrew.service'
import { AirportCrewResolver } from './airportCrew.resolver'
import { Staff } from '../entity/flightCrew.model'
import { SatffDataLoader } from '../loader/staff.loader'

@Module({
  imports: [
    SequelizeModule.forFeature([Employee, Flight, User, Staff]),
    forwardRef(() => AirportModule),
    UserModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [AirportCrewResolver, AirportCrewService, SatffDataLoader],
  exports: [SequelizeModule, AirportCrewService, SatffDataLoader],
})
export class AirportCrewModule {}
