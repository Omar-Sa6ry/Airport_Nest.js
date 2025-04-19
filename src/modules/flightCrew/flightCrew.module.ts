import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { FlightCrew } from './entity/flightCrew.model'
import { User } from '../users/entities/user.entity'
import { Employee } from '../employee/entity/employee.model'
import { Flight } from '../flight/entity/flight.model'
import { UserModule } from '../users/users.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { FlightCrewResolver } from './flightCrew.resolver'
import { FlightCrewService } from './flightCrew.service'
import { FlightCrewDataLoader } from './loader/flightCrew.loader'

@Module({
  imports: [
    SequelizeModule.forFeature([Employee, Flight, User, FlightCrew]),
    UserModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [FlightCrewResolver, FlightCrewService, FlightCrewDataLoader],
})
export class FlightCrewModule {}
