import { forwardRef, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Airline } from './entity/airline.model'
import { Flight } from '../flight/entity/flight.model'
import { User } from '../users/entities/user.entity'
import { UserModule } from '../users/users.module'
import { LocationModule } from '../location/location.module'
import { AirlineResolver } from './airline.resolver'
import { AirlineService } from './airline.service'
import { FlightModule } from '../flight/flight.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Airline, Flight, User]),
    forwardRef(() => FlightModule),
    UserModule,
    LocationModule,
  ],
  providers: [AirlineResolver, AirlineService],
  exports: [AirlineService],
})
export class AirlineModule {}
