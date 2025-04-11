import { forwardRef, Module } from '@nestjs/common'
import { RedisModule } from 'src/common/redis/redis.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { EmployeeResolver } from './employee.resolver'
import { EmployeeService } from './employee.service'
import { Employee } from './entity/employee.model'
import { User } from '../users/entities/user.entity'
import { UserModule } from '../users/users.module'
import { EmployeeLoader } from './loader/Employee.loader'
import { Airport } from '../airport/entity/airport.model'
import { AirportModule } from '../airport/airport.module'

@Module({
  imports: [
    SequelizeModule.forFeature([User, Airport, Employee]),
    UserModule,
    AirportModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [EmployeeResolver, EmployeeService, EmployeeLoader],
  exports: [EmployeeService,SequelizeModule],
})
export class EmployeeModule {}
