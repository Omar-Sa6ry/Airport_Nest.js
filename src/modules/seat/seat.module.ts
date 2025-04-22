import { forwardRef, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { UserModule } from '../users/users.module'
import { AirlineModule } from '../airline/airline.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { SeatResolver } from './seat.resolver'
import { SeatService } from './seat.service'
import { FlightModule } from '../flight/flight.module'
import { Flight } from '../flight/entity/flight.model'
import { Airline } from '../airline/entity/airline.model'
import { Gate } from '../gate/entity/gate.model'
import { Airport } from '../airport/entity/airport.model'
import { Seat } from './entity/seat.model'

@Module({
  imports: [
    SequelizeModule.forFeature([Flight, Seat, Airline, Gate, Airport]),
    forwardRef(() => FlightModule),
    UserModule,
    AirlineModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [SeatResolver, SeatService],
  exports: [SeatService, SequelizeModule],
})
export class SeatModule {}
