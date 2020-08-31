import { withSession, ApiRequest } from "../../../lib/session"
import { NextApiResponse } from "next"
import { getUser } from "../../../lib/userDb"
import { setApproval } from "../../../lib/planningDb"

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

  const userName = req.body.userName as string | undefined
  const approval = req.body.approval as boolean | undefined
  const weekNumber = req.body.weekNumber as string | undefined
  const dayNumber = req.body.dayNumber as string | undefined
  const startHour = req.body.startHour as string | undefined

  if (userName && approval !== undefined && weekNumber && dayNumber && startHour) {
    await setApproval(userName, approval, Number(weekNumber), Number(dayNumber), Number(startHour))
    res.status(200).json({
      message: `Présence ${
        approval ? "approuvée" : "refusée"
      } pour ${userName} le jour ${dayNumber} de la semaine ${weekNumber} à ${startHour}h.`,
    })
  } else {
    res.status(400).json({ message: "Mauvaise requête." })
  }
})
