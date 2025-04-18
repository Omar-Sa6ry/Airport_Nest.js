import { Module } from '@nestjs/common'
import { RedisModule } from 'src/common/redis/redis.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { UserModule } from '../users/users.module'
import { Seat } from './entity/Seat.model'
import { Flight } from '../flight/entity/flight.model'
import { SeatService } from './seat.service'
import { SeatResolver } from './seat.resolver'
import { Gate } from '../gate/entity/gate.model'
import { Airport } from '../airport/entity/airport.model'
import { FlightModule } from '../flight/flight.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Flight, Gate, Airport, Seat]),
    UserModule,
    FlightModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [SeatResolver, SeatService],
  exports: [SeatService, FlightModule, SequelizeModule],
})
export class SeatModule {}
