import { forwardRef, Module } from '@nestjs/common'
import { AirportService } from './airport.service'
import { AirportResolver } from './airport.resolver'
import { SequelizeModule } from '@nestjs/sequelize'
import { Airport } from './entity/airport.model'
import { LocationModule } from '../location/location.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { TerminalModule } from '../terminal/terminal.module'
import { EmployeeModule } from '../employee/employee.module'
import { GateModule } from '../gate/gate.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { Gate } from '../gate/entity/gate.model'
import { FlightModule } from '../flight/flight.module'
import { AirportCrewModule } from '../flightCrew/airportCrew/airportCrew.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Airport, Gate]),
    LocationModule,
    forwardRef(() => TerminalModule),
    forwardRef(() => FlightModule),
    forwardRef(() => AirportCrewModule),
    EmployeeModule,
    GateModule,
    RedisModule,
    WebSocketModule,
  ],
  providers: [AirportService, AirportResolver],
  exports: [AirportService, SequelizeModule],
})
export class AirportModule {}
