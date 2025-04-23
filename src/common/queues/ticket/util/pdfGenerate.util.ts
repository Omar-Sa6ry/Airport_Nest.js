import PDFDocument = require('pdfkit')
import { Ticket } from '../../../../modules/ticket/entity/ticket.model'
import { UserInput } from 'src/modules/users/input/User.input'
import { Flight } from 'src/modules/flight/entity/flight.model'
import { SeatClass } from 'src/common/constant/enum.constant'

export async function generatePDF (
  ticket: Ticket,
  user: UserInput,
  flight: Flight,
  terminal: string,
  gate: string,
  seatClass: SeatClass,
  airline: string,
  seatNumber: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        bufferPages: true,
      })

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      // Elegant purple color palette
      const colors = {
        primary: '#6A0DAD', // Deep purple
        secondary: '#9C27B0', // Medium purple
        accent: '#E1BEE7', // Light purple
        darkAccent: '#4A148C', // Dark purple
        text: '#212121', // Dark text
        lightText: '#FFFFFF', // White text
      }

      // Gradient background
      const gradient = doc.linearGradient(0, 0, doc.page.width, doc.page.height)
      gradient.stop(0, colors.primary)
      gradient.stop(1, colors.secondary)
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(gradient)

      // Decorative header with airline logo
      doc.fill(colors.darkAccent).rect(0, 0, doc.page.width, 100).fill()

      doc
        .fill(colors.lightText)
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(airline.toUpperCase(), 50, 40)

      // Main ticket container with shadow effect
      doc
        .fill(colors.lightText)
        .roundedRect(40, 80, doc.page.width - 80, doc.page.height - 160, 15)
        .fill()

      // Ticket title
      doc
        .fill(colors.primary)
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('ELECTRONIC BOARDING PASS', {
          align: 'center',
          width: doc.page.width - 100,
          lineGap: 10,
        })

      // Passenger information section
      doc
        .fill(colors.secondary)
        .roundedRect(60, 150, doc.page.width - 120, 70, 10)
        .fill()

      doc
        .fill(colors.lightText)
        .fontSize(16)
        .text(`PASSENGER: ${user.firstName} ${user.lastName}`, 80, 170)
        .text(`TICKET #: ${ticket.id}`, 80, 200)

      // Flight details in elegant cards
      const drawDetailCard = (
        x: number,
        y: number,
        title: string,
        value: string,
      ) => {
        doc.fill(colors.accent).roundedRect(x, y, 160, 80, 8).fill()
        doc
          .fill(colors.text)
          .fontSize(12)
          .text(title, x + 15, y + 15)
        doc
          .fill(colors.primary)
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(value, x + 15, y + 40)
      }

      // Flight details section
      drawDetailCard(60, 250, 'FLIGHT NUMBER', flight.flightNumber)
      drawDetailCard(240, 250, 'GATE', gate)
      drawDetailCard(420, 250, 'TERMINAL', terminal)

      // Flight route visualization
      doc
        .moveTo(60, 360)
        .lineTo(doc.page.width - 60, 360)
        .stroke(colors.primary, 3)

      doc.fill(colors.primary).circle(60, 360, 10).fill()
      doc
        .fill(colors.primary)
        .circle(doc.page.width - 60, 360, 10)
        .fill()

      doc
        .fill(colors.text)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(flight?.fromAirport?.dataValues?.name, 60, 380)
        .text(flight?.toAirport?.dataValues?.name, doc.page.width - 160, 380)

      doc
        .fill(colors.secondary)
        .fontSize(12)
        .text(flight?.leaveAt.toLocaleString(), 60, 400)
        .text(flight.arriveAt.toLocaleString(), doc.page.width - 160, 400)

      // Seat information section
      doc
        .fill(colors.secondary)
        .roundedRect(60, 430, doc.page.width - 120, 100, 10)
        .fill()

      doc
        .fill(colors.lightText)
        .fontSize(14)
        .text('SEAT', 80, 450)
        .text('CLASS', 200, 450)
        .text('STATUS', 400, 450)
        .text('AIRLINE', 400, 450)

      doc
        .fill(colors.lightText)
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(seatNumber.toString(), 80, 480)
        .text(seatClass, 200, 480)
        .text(ticket.status, 400, 480)
        .text(airline, 400, 510)

      // Barcode area
      doc
        .fill(colors.accent)
        .roundedRect(doc.page.width / 2 - 120, 550, 240, 60, 5)
        .fill()

      doc
        .fill(colors.primary)
        .fontSize(14)
        .text(
          `TICKET ID: ${ticket.id.substring(0, 8).toUpperCase()}`,
          doc.page.width / 2 - 110,
          570,
        )

      // Footer note
      doc
        .fill(colors.lightText)
        .fontSize(12)
        .font('Helvetica-Oblique')
        .text(
          'Thank you for choosing our airline. Safe travels!',
          doc.page.width / 2,
          doc.page.height - 50,
          { align: 'center' },
        )

      // Decorative elements
      doc
        .fill(colors.accent)
        .circle(doc.page.width - 100, 100, 30)
        .fill()
      doc
        .fill(colors.accent)
        .circle(100, doc.page.height - 100, 20)
        .fill()

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
