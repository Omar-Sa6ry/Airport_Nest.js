import { registerEnumType } from '@nestjs/graphql'

export enum Role {
  PASSENGER = 'passenger',
  ADMIN = 'admin',
  MANAGER = 'manager',
  PILOT = 'pilot',
  SECURITY = 'security',
  GROUND_STAFF = 'ground_staff',
  AIRLINE_MANAGER = 'airline_manager',
  FLIGHT_ATTENDANT = 'flight_attendant',
}
export const AllRoles: Role[] = Object.values(Role)

registerEnumType(Role, {
  name: 'Role',
  description: 'User roles in the system',
})

export enum EmployeeRole {
  ADMIN = 'admin',
  PILOT = 'pilot',
  SECURITY = 'security',
  GROUND_STAFF = 'ground_staff',
  FLIGHT_ATTENDANT = 'flight_attendant',
}

registerEnumType(EmployeeRole, {
  name: 'EmployeeRole',
  description: 'Employee roles in the system',
})

export enum Permission {
  AIRLINE_CREATE = 'airline:create',
  AIRLINE_READ = 'airline:read',
  AIRLINE_UPDATE = 'airline:update',
  AIRLINE_DELETE = 'airline:delete',
  AIRLINE_MANAGE_FLIGHTS = 'airline:manage_flights',

  EMPLOYEE_CREATE = 'employee:create',
  EMPLOYEE_READ = 'employee:read',
  EMPLOYEE_READ_ALL = 'employee:read_all',
  EMPLOYEE_DELETE = 'employee:delete',
  EMPLOYEE_PROMOTE = 'employee:promote',
  EMPLOYEE_UPDATE_ROLE = 'employee:update_role',

  CHECKIN_CREATE = 'CHECKIN_CREATE',
  CHECKIN_READ = 'CHECKIN_READ',
  CHECKIN_READ_OWN = 'CHECKIN_READ_OWN',
  CHECKIN_DELETE = 'CHECKIN_DELETE',

  FLIGHT_CREATE = 'FLIGHT_CREATE',
  FLIGHT_UPDATE = 'FLIGHT_UPDATE',
  FLIGHT_DELETE = 'FLIGHT_DELETE',
  FLIGHT_CANCEL = 'FLIGHT_CANCEL',
  FLIGHT_DELAY = 'FLIGHT_DELAY',
  FLIGHT_CHANGE_GATE = 'FLIGHT_CHANGE_GATE',

  FLIGHT_CREW_CREATE = 'FLIGHT_CREW_CREATE',
  FLIGHT_CREW_DELETE = 'FLIGHT_CREW_DELETE',

  GATE_CREATE = 'GATE_CREATE',
  GATE_UPDATE = 'GATE_UPDATE',
  GATE_DELETE = 'GATE_DELETE',

  TICKET_UPDATE = 'TICKET_UPDATE',
  TICKET_DELETE = 'TICKET_DELETE',
  TICKET_VIEW = 'TICKET_VIEW',
  TICKET_ALL_VIEW = 'TICKET_VIEW',

  USER_VIEW = 'USER_VIEW',
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',

  LOCATION_UPDATE_SELF = 'LOCATION_UPDATE_SELF',
  LOCATION_UPDATE_AIRLINE = 'LOCATION_UPDATE_AIRLINE',
  LOCATION_UPDATE_AIRPORT = 'LOCATION_UPDATE_AIRPORT',

  TERMINAL_VIEW = 'TERMINAL_VIEW',

  SEAT_CREATE = 'SEAT_CREATE',
  SEAT_UPDATE = 'SEAT_UPDATE',
  SEAT_DELETE = 'SEAT_DELETE',
  SEAT_BOOK = 'SEAT_BOOK',
  SEAT_UNBOOK = 'SEAT_UNBOOK',

  ACCOUNT_CHANGE_PASSWORD = 'account:change_password',
  ACCOUNT_RESET_PASSWORD = 'account:reset_password',

  ADMIN_ACCESS = 'admin:access',
  ADMIN_MANAGE_USERS = 'admin:manage_users',

  AUTH_LOGIN = 'auth:login',
  AUTH_REGISTER = 'auth:register',

  AIRPORT_CREATE = 'airport:create',
  AIRPORT_READ = 'airport:read',
  AIRPORT_READ_ALL = 'airport:read_all',
  AIRPORT_UPDATE = 'airport:update',
  AIRPORT_DELETE = 'airport:delete',

  TERMINAL_CREATE = 'terminal:create',
  TERMINAL_READ = 'terminal:read',
  TERMINAL_UPDATE = 'terminal:update',
  TERMINAL_DELETE = 'terminal:delete',

  BAGGAGE_READ = 'baggage:read',
  BAGGAGE_READ_ALL = 'baggage:read_all',
  BAGGAGE_UPDATE = 'baggage:update',
  BAGGAGE_DELETE = 'baggage:delete',
}

registerEnumType(Permission, {
  name: 'Permission',
  description: 'Detailed permissions in the system',
})

export enum CrewRole {
  CREW = 'crew',
  PILOT = 'pilot',
  SECURITY = 'security',
  FLIGHT_ATTENDANT = 'flight_attendant',
}

registerEnumType(CrewRole, {
  name: 'CrewRole',
})

export enum Permission {
  MANAGE_PASSENGERS = 'manage_passengers',
  MANAGE_FLIGHTS = 'manage_flights',
  MANAGE_STAFF = 'manage_staff',
  CHECK_FLIGHT_DETAILS = 'check_flight_details',
  BOOK_FLIGHT = 'book_flight',
  ALLOCATE_SEATS = 'allocate_seats',
}

registerEnumType(Permission, {
  name: 'Permission',
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

export enum Currency {
  AED = 'aed', // United Arab Emirates Dirham
  AFN = 'afn', // Afghan Afghani
  ALL = 'all', // Albanian Lek
  AMD = 'amd', // Armenian Dram
  ANG = 'ang', // Netherlands Antillean Guilder
  AOA = 'aoa', // Angolan Kwanza
  ARS = 'ars', // Argentine Peso
  AUD = 'aud', // Australian Dollar
  AWG = 'awg', // Aruban Florin
  AZN = 'azn', // Azerbaijani Manat
  BAM = 'bam', // Bosnia and Herzegovina Convertible Mark
  BBD = 'bbd', // Barbadian Dollar
  BDT = 'bdt', // Bangladeshi Taka
  BGN = 'bgn', // Bulgarian Lev
  BHD = 'bhd', // Bahraini Dinar
  BIF = 'bif', // Burundian Franc
  BMD = 'bmd', // Bermudian Dollar
  BND = 'bnd', // Brunei Dollar
  BOB = 'bob', // Bolivian Boliviano
  BRL = 'brl', // Brazilian Real
  BSD = 'bsd', // Bahamian Dollar
  BTN = 'btn', // Bhutanese Ngultrum
  BWP = 'bwp', // Botswanan Pula
  BYN = 'byn', // Belarusian Ruble
  BZD = 'bzd', // Belize Dollar
  CAD = 'cad', // Canadian Dollar
  CDF = 'cdf', // Congolese Franc
  CHF = 'chf', // Swiss Franc
  CLP = 'clp', // Chilean Peso
  CNY = 'cny', // Chinese Yuan
  COP = 'cop', // Colombian Peso
  CRC = 'crc', // Costa Rican Colón
  CUP = 'cup', // Cuban Peso
  CVE = 'cve', // Cape Verdean Escudo
  CZK = 'czk', // Czech Koruna
  DJF = 'djf', // Djiboutian Franc
  DKK = 'dkk', // Danish Krone
  DOP = 'dop', // Dominican Peso
  DZD = 'dzd', // Algerian Dinar
  EGP = 'egp', // Egyptian Pound
  ERN = 'ern', // Eritrean Nakfa
  ETB = 'etb', // Ethiopian Birr
  EUR = 'eur', // Euro
  FJD = 'fjd', // Fijian Dollar
  FKP = 'fkp', // Falkland Islands Pound
  GBP = 'gbp', // British Pound Sterling
  GEL = 'gel', // Georgian Lari
  GGP = 'ggp', // Guernsey Pound
  GHS = 'ghs', // Ghanaian Cedi
  GIP = 'gip', // Gibraltar Pound
  GMD = 'gmd', // Gambian Dalasi
  GNF = 'gnf', // Guinean Franc
  GTQ = 'gtq', // Guatemalan Quetzal
  GYD = 'gyd', // Guyanaese Dollar
  HKD = 'hkd', // Hong Kong Dollar
  HNL = 'hnl', // Honduran Lempira
  HRK = 'hrk', // Croatian Kuna
  HTG = 'htg', // Haitian Gourde
  HUF = 'huf', // Hungarian Forint
  IDR = 'idr', // Indonesian Rupiah
  ILS = 'ils', // Israeli New Shekel
  IMP = 'imp', // Isle of Man Pound
  INR = 'inr', // Indian Rupee
  IQD = 'iqd', // Iraqi Dinar
  IRR = 'irr', // Iranian Rial
  ISK = 'isk', // Icelandic Króna
  JEP = 'jep', // Jersey Pound
  JMD = 'jmd', // Jamaican Dollar
  JOD = 'jod', // Jordanian Dinar
  JPY = 'jpy', // Japanese Yen
  KES = 'kes', // Kenyan Shilling
  KGS = 'kgs', // Kyrgystani Som
  KHR = 'khr', // Cambodian Riel
  KMF = 'kmf', // Comorian Franc
  KPW = 'kpw', // North Korean Won
  KRW = 'krw', // South Korean Won
  KWD = 'kwd', // Kuwaiti Dinar
  KYD = 'kyd', // Cayman Islands Dollar
  KZT = 'kzt', // Kazakhstani Tenge
  LAK = 'lak', // Laotian Kip
  LBP = 'lbp', // Lebanese Pound
  LKR = 'lkr', // Sri Lankan Rupee
  LRD = 'lrd', // Liberian Dollar
  LSL = 'lsl', // Lesotho Loti
  LYD = 'lyd', // Libyan Dinar
  MAD = 'mad', // Moroccan Dirham
  MDL = 'mdl', // Moldovan Leu
  MGA = 'mga', // Malagasy Ariary
  MKD = 'mkd', // Macedonian Denar
  MMK = 'mmk', // Myanmar Kyat
  MNT = 'mnt', // Mongolian Tugrik
  MOP = 'mop', // Macanese Pataca
  MRU = 'mru', // Mauritanian Ouguiya
  MUR = 'mur', // Mauritian Rupee
  MVR = 'mvr', // Maldivian Rufiyaa
  MWK = 'mwk', // Malawian Kwacha
  MXN = 'mxn', // Mexican Peso
  MYR = 'myr', // Malaysian Ringgit
  MZN = 'mzn', // Mozambican Metical
  NAD = 'nad', // Namibian Dollar
  NGN = 'ngn', // Nigerian Naira
  NIO = 'nio', // Nicaraguan Córdoba
  NOK = 'nok', // Norwegian Krone
  NPR = 'npr', // Nepalese Rupee
  NZD = 'nzd', // New Zealand Dollar
  OMR = 'omr', // Omani Rial
  PAB = 'pab', // Panamanian Balboa
  PEN = 'pen', // Peruvian Sol
  PGK = 'pgk', // Papua New Guinean Kina
  PHP = 'php', // Philippine Peso
  PKR = 'pkr', // Pakistani Rupee
  PLN = 'pln', // Polish Złoty
  PYG = 'pyg', // Paraguayan Guarani
  QAR = 'qar', // Qatari Rial
  RON = 'ron', // Romanian Leu
  RSD = 'rsd', // Serbian Dinar
  RUB = 'rub', // Russian Ruble
  RWF = 'rwf', // Rwandan Franc
  SAR = 'sar', // Saudi Riyal
  SBD = 'sbd', // Solomon Islands Dollar
  SCR = 'scr', // Seychellois Rupee
  SDG = 'sdg', // Sudanese Pound
  SEK = 'sek', // Swedish Krona
  SGD = 'sgd', // Singapore Dollar
  SHP = 'shp', // Saint Helena Pound
  SLL = 'sll', // Sierra Leonean Leone
  SOS = 'sos', // Somali Shilling
  SRD = 'srd', // Surinamese Dollar
  SSP = 'ssp', // South Sudanese Pound
  STN = 'stn', // São Tomé and Príncipe Dobra
  SYP = 'syp', // Syrian Pound
  SZL = 'szl', // Swazi Lilangeni
  THB = 'thb', // Thai Baht
  TJS = 'tjs', // Tajikistani Somoni
  TMT = 'tmt', // Turkmenistani Manat
  TND = 'tnd', // Tunisian Dinar
  TOP = 'top', // Tongan Pa’anga
  TRY = 'try', // Turkish Lira
  TTD = 'ttd', // Trinidad and Tobago Dollar
  TWD = 'twd', // New Taiwan Dollar
  TZS = 'tzs', // Tanzanian Shilling
  UAH = 'uah', // Ukrainian Hryvnia
  UGX = 'ugx', // Ugandan Shilling
  USD = 'usd', // United States Dollar
  UYU = 'uyu', // Uruguayan Peso
  UZS = 'uzs', // Uzbekistani Som
  VES = 'ves', // Venezuelan Bolívar Soberano
  VND = 'vnd', // Vietnamese Dong
  VUV = 'vuv', // Vanuatu Vatu
  WST = 'wst', // Samoan Tala
  XAF = 'xaf', // Central African CFA Franc
  XCD = 'xcd', // East Caribbean Dollar
  XOF = 'xof', // West African CFA Franc
  XPF = 'xpf', // CFP Franc
  YER = 'yer', // Yemeni Rial
  ZAR = 'zar', // South African Rand
  ZMW = 'zmw', // Zambian Kwacha
  ZWL = 'zwl', // Zimbabwean Dollar
}
registerEnumType(Currency, { name: 'Currency' })
