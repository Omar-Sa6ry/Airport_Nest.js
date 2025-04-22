import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize'
import { Airline } from 'src/modules/airline/entity/airline.model'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Baggage } from 'src/modules/baggage/entity/baggage.model'
import { CheckIn } from 'src/modules/checkIn/entity/checkIn.entity'
import { Employee } from 'src/modules/employee/entity/employee.model'
import { Flight } from 'src/modules/flight/entity/flight.model'
import { FlightCrew } from 'src/modules/flightCrew/entity/flightCrew.model'
import { Gate } from 'src/modules/gate/entity/gate.model'
import { Location } from 'src/modules/location/entity/location.model'
import { Seat } from 'src/modules/seat/entity/seat.model'
import { Terminal } from 'src/modules/terminal/entity/terminal.model'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { User } from 'src/modules/users/entities/user.entity'

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): SequelizeModuleOptions => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        models: [
          User,
          Location,
          Passenger,
          Employee,
          Airline,
          Airport,
          FlightCrew,
          Terminal,
          Gate,
          Flight,
          Seat,
          Ticket,
          CheckIn,
          Baggage,
        ],
        autoLoadModels: true,
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DataBaseModule {}
