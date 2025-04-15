import { Module } from '@nestjs/common'
import { RedisModule } from 'src/common/redis/redis.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { UserModule } from '../users/users.module'
import { TerminalResolver } from './terminal.resolver'
import { TerminalService } from './terminal.service'
import { Terminal } from './entity/terminal.model'
import { Airport } from '../airport/entity/airport.model'
import { AirportService } from '../airport/airport.service'
import { EmployeeLoader } from '../employee/loader/Employee.loader'

@Module({
  imports: [
    SequelizeModule.forFeature([Airport, Terminal]),
    UserModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [
    TerminalResolver,
    TerminalService,
    AirportService,
    EmployeeLoader,
  ],
})
export class TerminalModule {}
