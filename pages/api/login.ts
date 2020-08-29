import { NextApiResponse } from "next"
import { loginUser } from "../../lib/db"
import { withSession, ApiRequest } from "../../lib/session"

export default withSession(async (req: ApiRequest, res: NextApiResponse) => {
  if (req.body.name && req.body.password) {
    const user = loginUser(req.body.name, req.body.password)
    if (!user) {
      res.status(401).json({ message: "Impossible de se connecter." })
      return
    }
    req.session.set("name", user.name)
    await req.session.save()
    res.status(200).json({ message: "Connection établie." })
  }
})
