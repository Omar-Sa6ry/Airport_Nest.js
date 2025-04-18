import { Module } from '@nestjs/common'
import { RedisModule } from 'src/common/redis/redis.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { UserModule } from '../users/users.module'
import { Gate } from './entity/gate.model'
import { Terminal } from '../terminal/entity/terminal.model'
import { GateResolver } from './gate.resolver'
import { GateService } from './gate.service'

@Module({
  imports: [
    SequelizeModule.forFeature([Gate, Terminal]),
    UserModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [GateResolver, GateService],
  exports: [GateService, SequelizeModule],
})
export class GateModule {}
