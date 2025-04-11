import { Module } from '@nestjs/common'
import { RedisModule } from 'src/common/redis/redis.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { Airport } from './entity/airport.model'
import { Employee } from '../employee/entity/employee.model'
import { UserModule } from '../users/users.module'
import { AirportResolver } from './airport.resolver'
import { AirportService } from './airport.service'
import { AirportLoader } from './loader/airport.loader'
import { EmployeeLoader } from '../employee/loader/Employee.loader'

@Module({
  imports: [
    SequelizeModule.forFeature([Employee, Airport]),
    UserModule,
    WebSocketModule,
    RedisModule,
  ],
  providers: [AirportResolver, AirportService, AirportLoader, EmployeeLoader],
  exports: [AirportService, SequelizeModule],
})
export class AirportModule {}
