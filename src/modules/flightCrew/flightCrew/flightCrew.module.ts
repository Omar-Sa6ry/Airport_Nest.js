import { forwardRef, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from '../../users/entities/user.entity'
import { Employee } from '../../employee/entity/employee.model'
import { Flight } from '../../flight/entity/flight.model'
import { UserModule } from '../../users/users.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { FlightCrewResolver } from './flightCrew.resolver'
import { FlightCrewService } from './flightCrew.service'
import { SatffDataLoader } from '../loader/staff.loader'
import { FlightModule } from '../../flight/flight.module'
import { Staff } from '../entity/flightCrew.model'

@Module({
  imports: [
    SequelizeModule.forFeature([Employee, Flight, User, Staff]),
    forwardRef(() => FlightModule),
    UserModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [FlightCrewResolver, FlightCrewService, SatffDataLoader],
  exports: [SequelizeModule, FlightCrewService, SatffDataLoader],
})
export class FlightCrewModule {}
