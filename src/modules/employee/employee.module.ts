import { forwardRef, Module } from '@nestjs/common'
import { RedisModule } from 'src/common/redis/redis.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { EmployeeResolver } from './employee.resolver'
import { Employee } from './entity/employee.model'
import { User } from '../users/entities/user.entity'
import { UserModule } from '../users/users.module'
import { EmployeeLoader } from './loader/Employee.loader'
import { Airport } from '../airport/entity/airport.model'
import { EmployeeService } from './employee.service'
import { AirportService } from '../airport/airport.service'
import { LocationModule } from '../location/location.module'

@Module({
  imports: [
    SequelizeModule.forFeature([User, Airport, Employee]),
    UserModule,
    LocationModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [
    EmployeeResolver,
    EmployeeService,
    EmployeeLoader,
    AirportService,
  ],
  exports: [EmployeeService, SequelizeModule],
})
export class EmployeeModule {}
