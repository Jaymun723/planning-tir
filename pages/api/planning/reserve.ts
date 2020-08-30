import { ApiRequest, withSession } from "../../../lib/session"
import { NextApiResponse } from "next"
import { setReservation } from "../../../lib/planningDb"

export default withSession(async (req: ApiRequest, res: NextApiResponse) => {
  const name = req.session.get("name")
  if (!name) {
    res.status(401).json({ message: "Connection nécessaire." })
    return
  }

  if (req.method === "POST") {
    let weekNumber = req.body.weekNumber as string
    let dayNumber = req.body.dayNumber as string
    let startHour = req.body.startHour as string

    if (weekNumber && dayNumber && startHour) {
      await setReservation(name, Number(weekNumber), Number(dayNumber), Number(startHour))
      res
        .status(200)
        .json({ message: `Réservation pour le jour ${dayNumber} de la semaine ${weekNumber} à ${startHour}h.` })
    } else {
      res.status(400).json({ message: "Mauvaise requête." })
    }
  } else {
    res.status(405).json({ message: "Mauvaise méthode." })
  }
})
