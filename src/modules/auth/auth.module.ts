import { Module } from '@nestjs/common'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { GenerateToken } from './jwt/jwt.service'
import { UserModule } from '../users/users.module'
import { User } from '../users/entities/user.entity'
import { RedisModule } from 'src/common/redis/redis.module'
import { UploadModule } from '../../common/upload/upload.module'
import { EmailModule } from 'src/common/queues/email/email.module'
import { SendEmailService } from 'src/common/queues/email/sendemail.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { JwtModule } from './jwt/jwt.module'
import { Employee } from '../employee/entity/employee.model'
import { Passenger } from '../users/entities/passenger.model'
import { AirportModule } from '../airport/airport.module'

@Module({
  imports: [
    SequelizeModule.forFeature([User, Employee, Passenger]),
    UserModule,
    RedisModule,
    UploadModule,
    AirportModule,
    EmailModule,
    WebSocketModule,
    JwtModule,
  ],
  providers: [AuthResolver, AuthService, SendEmailService, GenerateToken],
})
export class AuthModule {}
