import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AppResolver } from './app.resolver'
import { ConfigModule } from './common/config/config.module'
import { TranslationModule } from './common/translation/translation.module'
import { GraphqlModule } from './common/graphql/graphql.module'
import { DataBaseModule } from './common/database/database'
import { ThrottlerModule } from './common/throttler/throttling.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/users/users.module'
import { AirportModule } from './modules/airport/airport.module'
import { EmployeeModule } from './modules/employee/employee.module'
import { TerminalModule } from './modules/terminal/terminal.module'
import { GateModule } from './modules/gate/gate.module'
import { FlightModule } from './modules/flight/flight.module'
import { SeatModule } from './modules/seat/seat.module'
import { TicketModule } from './modules/ticket/ticket.module'
import { CheckInModule } from './modules/checkIn/checkIn.module'
import { LocationModule } from './modules/location/location.module'
import { AirlineModule } from './modules/airline/airline.module'
import { FlightCrewModule } from './modules/flightCrew/flightCrew.module'
import { BaggageModule } from './modules/baggage/baggage.module'

@Module({
  imports: [
    ConfigModule,
    GraphqlModule,
    DataBaseModule,
    ThrottlerModule,
    TranslationModule,

    AuthModule,
    UserModule,
    LocationModule,
    EmployeeModule,
    AirlineModule,
    AirportModule,
    TerminalModule,
    GateModule,
    FlightModule,
    SeatModule,
    FlightCrewModule,
    TicketModule,
    CheckInModule,
    BaggageModule,
  ],

  providers: [AppService, AppResolver],
})
export class AppModule {}
