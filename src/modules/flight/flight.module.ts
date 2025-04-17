import { Module } from '@nestjs/common'
import { RedisModule } from 'src/common/redis/redis.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { UserModule } from '../users/users.module'
import { Gate } from '../gate/entity/gate.model'
import { Flight } from './entity/flight.model'
import { Airport } from '../airport/entity/airport.model'
import { FlightResolver } from './flight.resolver'
import { FlightService } from './flight.service'
import { FlightFromAirportLoader } from './loaders/flight.FromAirportloader'
import { FlightToAirportLoader } from './loaders/flight.ToAirportloader'

@Module({
  imports: [
    SequelizeModule.forFeature([Gate, Flight, Airport]),
    UserModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [
    FlightResolver,
    FlightService,
    FlightToAirportLoader,
    FlightFromAirportLoader,
  ],
})
export class FlightModule {}
