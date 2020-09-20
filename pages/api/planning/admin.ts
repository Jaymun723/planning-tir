import { NextApiRequest, NextApiResponse } from "next"
import { getUser } from "../../../lib/userDb"
import { WEEKS_PREVIEW_COUNT } from "./"
import moment from "moment"
import { getWeeks } from "../../../lib/planningDb"
import { getUsersHistory } from "../../../lib/usersHistory"
import { authUser } from "../../../lib/auth"

moment.locale("fr")

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const user = authUser(req)
  if (!user) {
    res.status(401).json({ message: "Connection nécessaire." })
    return
  }

  if (!user.isAdmin) {
    res.status(401).json({ message: "Vous devez être administrateur." })
    return
  }

  const todayWeekNumber = moment().week()
  const weeksNumbers: number[] = []
  for (let i = 0; i < WEEKS_PREVIEW_COUNT; i++) {
    weeksNumbers.push(i + todayWeekNumber)
  }

  res.status(200).json({ weeks: await getWeeks(weeksNumbers), users: await getUsersHistory() })
}
