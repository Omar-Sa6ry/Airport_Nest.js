import { forwardRef, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Gate } from '../gate/entity/gate.model'
import { Flight } from './entity/flight.model'
import { Airline } from '../airline/entity/airline.model'
import { Airport } from '../airport/entity/airport.model'
import { SeatModule } from '../seat/seat.module'
import { AirportModule } from '../airport/airport.module'
import { AirlineModule } from '../airline/airline.module'
import { FlightCrewModule } from '../flightCrew/flightCrew/flightCrew.module'
import { NotifyModule } from 'src/common/queues/notify/notify.module'
import { UpdateFlightModule } from 'src/common/queues/update flight/UpdateFlight.module'
import { NotificationModule } from 'src/common/queues/notification/notification.module'
import { UserModule } from '../users/users.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { LocationModule } from '../location/location.module'
import { GateModule } from '../gate/gate.module'
import { TerminalModule } from '../terminal/terminal.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { FlightService } from './flight.service'
import { FlightToAirportLoader } from './loaders/flight.ToAirportloader'
import { FlightFromAirportLoader } from './loaders/flight.FromAirportloader'
import { NotifyService } from 'src/common/queues/notify/notify.service'
import { UpdateFlightService } from 'src/common/queues/update flight/UpdateFlight.service'
import { FlightResolver } from './flight.resolver'
import { TicketModule } from '../ticket/ticket.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Gate, Flight, Airline, Airport]),
    forwardRef(() => SeatModule),
    forwardRef(() => TicketModule),
    forwardRef(() => AirportModule),
    forwardRef(() => AirlineModule),
    forwardRef(() => FlightCrewModule),
    NotifyModule,
    UpdateFlightModule,
    NotificationModule,
    UserModule,
    TerminalModule,
    GateModule,
    LocationModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [
    FlightResolver,
    FlightService,
    UpdateFlightService,
    FlightToAirportLoader,
    FlightFromAirportLoader,
    NotifyService,
  ],
  exports: [
    SequelizeModule,
    FlightFromAirportLoader,
    FlightToAirportLoader,
    FlightService,
    UpdateFlightModule,
    NotifyModule,
  ],
})
export class FlightModule {}
