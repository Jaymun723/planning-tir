import { NextApiRequest, NextApiResponse } from "next"
import { getUser } from "../../../lib/userDb"
import { setApproval } from "../../../lib/planningDb"
import { getAcceptedMail, getRejectedMail, sendMail } from "../../../lib/mail"
import { authUser } from "../../../lib/auth"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const adminUser = authUser(req)
  if (!adminUser) {
    res.status(401).json({ message: "Connection nécessaire." })
    return
  }

  if (!adminUser.isAdmin) {
    res.status(401).json({ message: "Vous devez être administrateur." })
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Mauvaise méthode." })
    return
  }

  if (typeof req.body.approvals !== "object" || !Array.isArray(req.body.approvals)) {
    res.status(400).json({ message: "Mauvaise requête." })
    return
  }

  for (const a of req.body.approvals) {
    const userName = a.name
    const approval = a.approval
    const week = a.week
    const day = a.day
    const hour = a.hour
    const place = a.place

    const s = (a: any): a is string => typeof a === "string"
    const n = (a: any): a is number => typeof a === "number"
    const b = (a: any): a is boolean => typeof a === "boolean"

    if (s(userName) && b(approval) && n(week) && n(day) && n(hour) && n(place)) {
      const user = await getUser(userName)

      if (!user) {
        res.status(400).json({ message: "Impossible de trouver cet utilisateur." })
        return
      }

      await setApproval({
        approval,
        day,
        hour,
        name: userName,
        place,
        week,
      }).catch((err) => {
        res.status(400).json({ message: err.message })
      })

      const mail = approval ? getAcceptedMail({ place, week, day, hour, name: userName }) : getRejectedMail({ place, week, day, hour, name: userName })
      await sendMail({
        content: mail.text,
        subject: mail.title,
        to: user.email,
      })
    } else {
      res.status(400).json({ message: "Mauvaise requête." })
      return
    }
  }

  res.status(200).json({
    message: `ok`,
  })
}
