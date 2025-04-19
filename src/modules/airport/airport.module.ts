import { Module } from '@nestjs/common'
import { RedisModule } from 'src/common/redis/redis.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { Airport } from './entity/airport.model'
import { Employee } from '../employee/entity/employee.model'
import { UserModule } from '../users/users.module'
import { AirportResolver } from './airport.resolver'
import { AirportService } from './airport.service'
import { TerminalService } from '../terminal/terminal.service'
import { Terminal } from '../terminal/entity/terminal.model'
import { EmployeeService } from '../employee/employee.service'
import { EmployeeLoader } from '../employee/loader/Employee.loader'
import { LocationModule } from '../location/location.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Employee, Terminal, Airport]),
    UserModule,
    LocationModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [
    AirportResolver,
    AirportService,
    EmployeeService,
    TerminalService,
    EmployeeLoader,
  ],
  exports: [AirportService, SequelizeModule],
})
export class AirportModule {}
