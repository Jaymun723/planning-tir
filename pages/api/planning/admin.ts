import { withSession, ApiRequest } from "../../../lib/session"
import { NextApiResponse } from "next"
import { getUser } from "../../../lib/userDb"
import { WEEKS_PREVIEW_COUNT } from "./"
import moment from "moment"
import { getWeeks } from "../../../lib/planningDb"

moment.locale("fr")

export default withSession(async (req: ApiRequest, res: NextApiResponse) => {
  const name = req.session.get("name")
  if (!name) {
    res.status(401).json({ message: "Connection nécessaire." })
    return
  }

  const user = getUser(name)
  if (!user || !user.isAdmin) {
    res.status(401).json({ message: "Vous devez être administrateur." })
    return
  }

  const todayWeekNumber = moment().week()
  const weeksNumbers: number[] = []
  for (let i = 0; i < WEEKS_PREVIEW_COUNT; i++) {
    weeksNumbers.push(i + todayWeekNumber)
  }

  res.status(200).json({ weeks: await getWeeks(weeksNumbers) })
})
