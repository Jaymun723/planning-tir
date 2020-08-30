import moment from "moment"
import { withSession, ApiRequest } from "../../../lib/session"
import { NextApiResponse } from "next"
import { getWeeksForUser } from "../../../lib/planningDb"

moment.locale("fr")

export const WEEKS_PREVIEW_COUNT = 2

export default withSession(async (req: ApiRequest, res: NextApiResponse) => {
  const name = req.session.get("name")

  if (!name) {
    res.status(401).json({ message: "Connection nécessaire." })
    return
  }

  const todayWeekNumber = moment().week()
  const weeksNumbers: number[] = []
  for (let i = 0; i < WEEKS_PREVIEW_COUNT; i++) {
    weeksNumbers.push(i + todayWeekNumber)
  }

  res.status(200).json({ weeks: await getWeeksForUser(name, weeksNumbers) })
})
