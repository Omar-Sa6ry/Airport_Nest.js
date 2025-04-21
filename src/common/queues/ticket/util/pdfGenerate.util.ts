import PDFDocument = require('pdfkit')
import { Ticket } from '../../../../modules/ticket/entity/ticket.model'
import { UserInput } from 'src/modules/users/input/User.input'
import { Flight } from 'src/modules/flight/entity/flight.model'

export async function generatePDF (
  ticket: Ticket,
  user: UserInput,
  flight: Flight,
  terminal: string,
  gate: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      })

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      // Brown color palette
      const colors = {
        primary: '#5D4037',
        secondary: '#8D6E63',
        accent: '#D7CCC8',
        text: '#3E2723',
        lightText: '#EFEBE9',
      }

      // Add elegant background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.accent)

      // Header with decorative elements
      doc.fill(colors.primary).rect(0, 0, doc.page.width, 120).fill()

      // Add airline logo placeholder
      doc
        .fill(colors.lightText)
        .fontSize(16)
        .text('✈️ AIRLINE LOGO', 50, 40, { align: 'left' })

      // Main title with elegant styling
      doc
        .fill(colors.lightText)
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('BOARDING PASS', {
          align: 'center',
          width: doc.page.width - 100,
          lineGap: 5,
        })

      // Passenger info section with decorative border
      doc
        .fill(colors.secondary)
        .roundedRect(50, 150, doc.page.width - 100, 80, 10)
        .fill()

      doc
        .fill(colors.lightText)
        .fontSize(14)
        .text(`PASSENGER: ${user.firstName} ${user.lastName}`, 70, 170)
        .text(`TICKET #: ${ticket.id}`, 70, 190)

      // Flight details in elegant cards
      const drawDetailCard = (
        x: number,
        y: number,
        title: string,
        value: string,
      ) => {
        doc.fill(colors.accent).roundedRect(x, y, 150, 70, 5).fill()
        doc
          .fill(colors.text)
          .fontSize(10)
          .text(title, x + 10, y + 15)
        doc
          .fill(colors.primary)
          .fontSize(16)
          .font('Helvetica-Bold')
          .text(value, x + 10, y + 35)
      }

      // Flight details cards
      drawDetailCard(50, 250, 'FLIGHT NUMBER', flight.flightNumber)
      drawDetailCard(220, 250, 'GATE', gate)
      drawDetailCard(390, 250, 'TERMINAL', terminal)

      // Timeline visualization
      doc
        .moveTo(50, 350)
        .lineTo(doc.page.width - 50, 350)
        .stroke(colors.primary, 2)
      doc.fill(colors.primary).circle(50, 350, 8).fill()
      doc
        .fill(colors.primary)
        .circle(doc.page.width - 50, 350, 8)
        .fill()

      doc
        .fill(colors.text)
        .fontSize(12)
        .text(flight?.fromAirport?.dataValues?.name, 50, 370)
        .text(flight?.toAirport?.dataValues?.name, doc.page.width - 150, 370)

      doc
        .fill(colors.text)
        .fontSize(10)
        .text(flight?.leaveAt.toLocaleString(), 50, 390)
        .text(flight.arriveAt.toLocaleString(), doc.page.width - 150, 390)

      // Ticket details section
      doc
        .fill(colors.secondary)
        .roundedRect(50, 420, doc.page.width - 100, 120, 10)
        .fill()

      doc
        .fill(colors.lightText)
        .fontSize(12)
        .text('SEAT', 70, 440)
        .text('CLASS', 200, 440)
        .text('STATUS', 460, 440)

      doc
        .fill(colors.lightText)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(ticket.seatNumber, 70, 460)
        .text(ticket.class, 200, 460)
        .text(ticket.status, 460, 460)

      // Footer with decorative elements
      doc
        .fill(colors.primary)
        .rect(0, doc.page.height - 60, doc.page.width, 60)
        .fill()

      doc
        .fill(colors.lightText)
        .fontSize(12)
        .text(
          'Thank you for flying with us!',
          doc.page.width / 2,
          doc.page.height - 40,
          { align: 'center' },
        )

      // Add barcode placeholder
      doc
        .fill(colors.lightText)
        .rect(doc.page.width / 2 - 100, doc.page.height - 120, 200, 40)
        .fill()
      doc
        .fill(colors.primary)
        .fontSize(10)
        .text(
          'BARCODE: TKT-' + ticket.id.substring(0, 8).toUpperCase(),
          doc.page.width / 2 - 90,
          doc.page.height - 110,
        )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
