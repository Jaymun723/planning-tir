import { withSession, ApiRequest } from "../../lib/session"
import { NextApiResponse } from "next"
import { getUser } from "../../lib/userDb"

export default withSession(async (req: ApiRequest, res: NextApiResponse) => {
  const name = req.session.get("name")
  if (!name) {
    res.status(401).json({ message: "Vous n'êtes pas connecté." })
    return
  }
  res.status(200).json({ user: await getUser(name) })
})
