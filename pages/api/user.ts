import { NextApiRequest, NextApiResponse } from "next"
import { authUser } from "../../lib/auth"

export default (req: NextApiRequest, res: NextApiResponse) => {
  const user = authUser(req)
  if (!user) {
    res.status(401).json({ message: "Vous n'êtes pas connecté." })
    return
  }
  res.status(200).json({ user })
}
