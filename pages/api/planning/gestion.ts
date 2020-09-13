import { withSession, ApiRequest } from "../../../lib/session"
import { NextApiResponse } from "next"
import { getUser } from "../../../lib/userDb"
import { setApproval } from "../../../lib/planningDb"
import { getAcceptedMail, getRejectedMail, sendMail } from "../../../lib/mail"

export default withSession(async (req: ApiRequest, res: NextApiResponse) => {
  const name = req.session.get("name")
  if (!name) {
    res.status(401).json({ message: "Connection nécessaire." })
    return
  }

  const user = await getUser(name)
  if (!user || !user?.isAdmin) {
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

      const mail = approval ? getAcceptedMail({ place, week, day, hour }) : getRejectedMail({ place, week, day, hour })
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
})
