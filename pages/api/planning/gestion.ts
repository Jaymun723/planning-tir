import { withSession, ApiRequest } from "../../../lib/session"
import { NextApiResponse } from "next"
import { getUser } from "../../../lib/userDb"
import { setApproval } from "../../../lib/planningDb"
import { PLACES_MAP } from "../../../lib/consts"

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

  const userName = req.body.name
  const approval = req.body.approval
  const week = req.body.week
  const day = req.body.day
  const hour = req.body.hour
  const place = req.body.place

  const s = (a: any): a is string => typeof a === "string"
  const n = (a: any): a is number => typeof a === "number"
  const b = (a: any): a is boolean => typeof a === "boolean"

  if (s(userName) && b(approval) && n(week) && n(day) && n(hour) && n(place)) {
    await setApproval({
      approval,
      day,
      hour,
      name: userName,
      place,
      week,
    })
    res.status(200).json({
      message: `Présence ${
        approval ? "approuvée" : "refusée"
      } pour ${userName} le jour ${day} de la semaine ${week} à ${hour}h. (${PLACES_MAP[place].name})`,
    })
  } else {
    res.status(400).json({ message: "Mauvaise requête." })
  }
})
