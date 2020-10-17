import nodemailer from "nodemailer"
import Mail from "nodemailer/lib/mailer"
import moment from "moment"
import { PLACES_MAP } from "./consts"

moment.locale("fr")

interface GetMailOptions {
  week: number
  day: number
  hour: number
  place: number
  name: string
}
export const getAcceptedMail = (ops: GetMailOptions) => ({
  text: `Bonjour,

La réservation du créneau de ${ops.hour}h à ${ops.hour + 1}h du ${moment()
    .week(ops.week)
    .weekday(ops.day)
    .format("D MMMM YYYY")} à la ${PLACES_MAP[ops.place].name} est acceptée.

Cordialement,

Club de Tir de Palaiseau.

Mail envoyé à ${ops.name} par ${process.env.SITE_URL}
`,
  title: `Réservation confirmée pour séance de ${PLACES_MAP[ops.place].name} de ${ops.hour}h à ${
    ops.hour + 1
  }h le ${moment().week(ops.week).weekday(ops.day).format("DD[/]MM[/]YYYY")} au stand 10m`,
})

// export const getRejectedMail = (ops: GetMailOptions) => ({
//   text: `Bonjour,

// Nous somme désolé, il n'y a plus de place disponible pour le créneau de ${ops.hour}h à ${
//     ops.hour + 1
//   }h du ${moment().week(ops.week).weekday(ops.day).format("D MMMM YYYY")} à la ${PLACES_MAP[ops.place].name}.

// Cordialement,

// Club de Tir de Palaiseau.

// Mail envoyé à ${ops.name} par ${process.env.SITE_URL}
// `,
//   title: `Réservation impossible pour séance de ${PLACES_MAP[ops.place].name} de ${ops.hour}h à ${
//     ops.hour + 1
//   }h le ${moment().week(ops.week).weekday(ops.day).format("DD[/]MM[/]YYYY")} au stand 10m`,
// })

export const getRejectedMail = (ops: GetMailOptions) => ({
  text: `Bonjour,

Nous somme désolé, le stand 10m est fermé au moins jusqu'au 26 octobre.
C'est une décision du préfet et de la mairie pour des raisons sanitaires.

Cordialement,

Club de Tir de Palaiseau.

Mail envoyé à ${ops.name} par ${process.env.SITE_URL}
`,
  title: `Réservation impossible pour séance de ${PLACES_MAP[ops.place].name} de ${ops.hour}h à ${
    ops.hour + 1
  }h le ${moment().week(ops.week).weekday(ops.day).format("DD[/]MM[/]YYYY")} au stand 10m`,
})

let transporterCache: Mail | undefined

const DEV = false
const SENDER_EMAIL = '"Stand de tir 10m de Palaiseau" <ctpal91@gmail.com>'

interface SendMailOptions {
  to: string
  subject: string
  content: string
}
export const sendMail = async (ops: SendMailOptions) => {
  if (!transporterCache) {
    let host = process.env.SMTP_SERVER_URL
    let port = Number(process.env.SMTP_SERVER_PORT)
    let user = process.env.SMTP_USER_LOGIN
    let pass = process.env.SMTP_USER_PASSWORD
    if (DEV) {
      const testAccount = await nodemailer.createTestAccount()
      host = testAccount.smtp.host
      port = testAccount.smtp.port
      user = testAccount.user
      pass = testAccount.pass
    }
    transporterCache = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    })
  }

  const info = await transporterCache.sendMail({
    from: SENDER_EMAIL,
    subject: ops.subject,
    to: ops.to,
    text: ops.content,
  })

  if (DEV) {
    console.log(nodemailer.getTestMessageUrl(info))
  }
}
