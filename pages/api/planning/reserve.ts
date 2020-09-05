import { ApiRequest, withSession } from "../../../lib/session"
import { NextApiResponse } from "next"
import { setReservation } from "../../../lib/planningDb"
import { PLACES_MAP } from "../../../lib/consts"

export default withSession(async (req: ApiRequest, res: NextApiResponse) => {
  const name = req.session.get("name")
  if (!name) {
    res.status(401).json({ message: "Connection nécessaire." })
    return
  }

  if (req.method === "POST") {
    let week = req.body.week
    let day = req.body.day
    let hour = req.body.hour
    let place = req.body.place

    const n = (a: any): a is number => typeof a === "number"

    if (n(week) && n(day) && n(hour) && n(place)) {
      await setReservation({
        day,
        hour,
        name,
        place,
        week,
      })
      res.status(200).json({
        message: `Réservation pour le jour ${day} de la semaine ${week} à ${hour}h (${PLACES_MAP[place].name}).`,
      })
    } else {
      res.status(400).json({ message: "Mauvaise requête." })
    }
  } else {
    res.status(405).json({ message: "Mauvaise méthode." })
  }
})
