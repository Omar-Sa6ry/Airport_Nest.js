import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Airport } from '../airport/entity/airport.model'
import { Location } from './entity/location.model'
import { UserModule } from '../users/users.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { LocationResolver } from './location.resolver'
import { LocationService } from './location.service'
import { AirportLocationLoader } from './loaders/airportLocation.loader'
import { AirlineLocationLoader } from './loaders/airlineLocation.loader'
import { Airline } from '../airline/entity/airline.model'

@Module({
  imports: [
    SequelizeModule.forFeature([Airport, Airline, Location]),
    UserModule,
    WebSocketModule,
  ],
  providers: [
    LocationResolver,
    LocationService,
    AirlineLocationLoader,
    AirportLocationLoader,
  ],
  exports: [LocationService, SequelizeModule],
})
export class LocationModule {}
