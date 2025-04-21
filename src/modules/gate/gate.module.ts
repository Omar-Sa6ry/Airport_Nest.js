import { forwardRef, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Gate } from './entity/gate.model'
import { Terminal } from '../terminal/entity/terminal.model'
import { GateService } from './gate.service'
import { GateResolver } from './gate.resolver'
import { RedisModule } from 'src/common/redis/redis.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { GateLoader } from './loader/Gate.loader'
import { TerminalModule } from '../terminal/terminal.module'
import { User } from '../users/entities/user.entity'

@Module({
  imports: [
    SequelizeModule.forFeature([Gate, User, Terminal]),
    RedisModule,
    WebSocketModule,
    forwardRef(() => TerminalModule),
  ],
  providers: [GateService, GateResolver, GateLoader],
  exports: [GateService],
})
export class GateModule {}
