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
import { UpdateFlightService } from 'src/common/queues/update flight/UpdateFlight.service'
import { UpdateFlightModule } from 'src/common/queues/update flight/UpdateFlight.module'
import { NotificationModule } from 'src/common/queues/notification/notification.module'
import { scheduleQueueModule } from 'src/common/queues/schedule/scheduleQueue.module'
import { ScheduleService } from 'src/common/queues/schedule/schedule.service'

@Module({
  imports: [
    SequelizeModule.forFeature([Gate, Flight, Airport]),
    scheduleQueueModule,
    UpdateFlightModule,
    NotificationModule,
    UserModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [
    FlightResolver,
    FlightService,
    UpdateFlightService,
    FlightToAirportLoader,
    FlightFromAirportLoader,
    ScheduleService,
  ],
  exports: [
    SequelizeModule,
    FlightFromAirportLoader,
    FlightToAirportLoader,
    FlightService,
    UpdateFlightModule,
    scheduleQueueModule,
  ],
})
export class FlightModule {}
