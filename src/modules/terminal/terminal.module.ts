// terminal.module.ts
import { forwardRef, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { TerminalService } from './terminal.service'
import { TerminalResolver } from './terminal.resolver'
import { RedisModule } from 'src/common/redis/redis.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { Terminal } from './entity/terminal.model'
import { Airport } from '../airport/entity/airport.model'
import { AirportModule } from '../airport/airport.module'
import { GateModule } from '../gate/gate.module'
import { User } from '../users/entities/user.entity'

@Module({
  imports: [
    SequelizeModule.forFeature([Terminal, User, Airport]),
    RedisModule,
    WebSocketModule,
    forwardRef(() => AirportModule),
    forwardRef(() => GateModule),
  ],
  providers: [TerminalService, TerminalResolver],
  exports: [TerminalService],
})
export class TerminalModule {}
