import { Module } from '@nestjs/common'
import { User } from './entities/user.entity'
import { UserService } from './users.service'
import { UserResolver } from './users.resolver'
import { RedisModule } from 'src/common/redis/redis.module'
import { UploadService } from '../../common/upload/upload.service'
import { EmailModule } from 'src/common/queues/email/email.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { Employee } from './entities/employee.model'
import { Passenger } from './entities/passenger.model'

@Module({
  imports: [
    SequelizeModule.forFeature([User, Employee, Passenger]),
    EmailModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [UserService, UserResolver, UploadService],
  exports: [UserService],
})
export class UserModule {}
