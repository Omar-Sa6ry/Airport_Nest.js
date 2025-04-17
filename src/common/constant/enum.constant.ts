import { registerEnumType } from '@nestjs/graphql'

export enum Role {
  CREW = 'crew',
  PILOT = 'pilot',
  ADMIN = 'admin',
  MANAGER = 'manager',
  PASSENGER = 'passenger',
  SECURITY = 'security',
  GROUND_STAFF = 'ground_staff',
  AIRLINE_MANAGER = 'airline_manager',
  FLIGHT_ATTENDANT = 'flight_attendant',
}
registerEnumType(Role, {
  name: 'Role',
  description: 'User roles in the system',
})

export enum FlightStatus {
  SCHEDULED = 'scheduled',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
  IN_AIR = 'in_air',
  LANDED = 'landed',
}
registerEnumType(FlightStatus, { name: 'FlightStatus' })

export enum TicketClass {
  ECONOMY = 'ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST',
}
registerEnumType(TicketClass, { name: 'TicketClass' })

export enum TicketStatus {
  BOOKED = 'BOOKED',
  CANCELED = 'CANCELED',
  USED = 'USED',
}

registerEnumType(TicketStatus, { name: 'TicketStatus' })
