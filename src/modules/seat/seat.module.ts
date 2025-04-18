import { Module } from '@nestjs/common'
import { RedisModule } from 'src/common/redis/redis.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { UserModule } from '../users/users.module'
import { Seat } from './entity/Seat.model'
import { Flight } from '../flight/entity/flight.model'
import { SeatService } from './seat.service'
import { SeatResolver } from './seat.resolver'
import { FlightService } from '../flight/flight.service'
import { FlightFromAirportLoader } from '../flight/loaders/flight.FromAirportloader'
import { Gate } from '../gate/entity/gate.model'
import { Airport } from '../airport/entity/airport.model'
import { FlightToAirportLoader } from '../flight/loaders/flight.ToAirportloader'

@Module({
  imports: [
    SequelizeModule.forFeature([Flight, Gate, Airport, Seat]),
    UserModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [
    SeatResolver,
    SeatService,
    FlightFromAirportLoader,
    FlightToAirportLoader,
    FlightService,
  ],
  exports: [SeatService, SequelizeModule],
})
export class SeatModule {}
