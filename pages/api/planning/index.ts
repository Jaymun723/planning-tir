import moment from "moment"
import { NextApiRequest, NextApiResponse } from "next"
import { authUser } from "../../../lib/auth"
import { getWeeksForUser } from "../../../lib/planningDb"

moment.locale("fr")

export const WEEKS_PREVIEW_COUNT = 2

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const user = authUser(req)

  if (!user) {
    res.status(401).json({ message: "Connection nécessaire." })
    return
  }

  const todayWeekNumber = moment().week()
  const weeksNumbers: number[] = []
  for (let i = 0; i < WEEKS_PREVIEW_COUNT; i++) {
    weeksNumbers.push(i + todayWeekNumber)
  }

  res.status(200).json({ weeks: await getWeeksForUser(user.name, weeksNumbers) })
}
