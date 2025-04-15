import { registerEnumType } from '@nestjs/graphql'

export enum Role {
  CREW = 'crew',
  PILOT = 'pilot',
  ADMIN = 'admin',
  MANAGER = 'manager',
  PASSENGER = 'passenger',
  SECURITY = 'security',
  GROUND_STAFF = 'ground_staff',
  FLIGHT_ATTENDANT = 'flight_attendant',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'User roles in the system',
})
