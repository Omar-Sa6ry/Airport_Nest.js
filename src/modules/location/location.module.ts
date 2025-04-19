import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Airport } from '../airport/entity/airport.model'
import { Location } from './entity/location.model'
import { UserModule } from '../users/users.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { LocationResolver } from './location.resolver'
import { LocationService } from './location.service'
import { AirportLocationLoader } from './loader/airportLocation.loader'

@Module({
  imports: [
    SequelizeModule.forFeature([Airport, Location]),
    UserModule,
    WebSocketModule,
  ],
  providers: [LocationResolver, LocationService, AirportLocationLoader],
  exports: [LocationService, SequelizeModule],
})
export class LocationModule {}
