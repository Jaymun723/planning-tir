import { NextApiResponse } from "next"
import { loginUser } from "../../lib/userDb"
import { withSession, ApiRequest } from "../../lib/session"

export default withSession((req: ApiRequest, res: NextApiResponse) => {
  if (req.body.name && req.body.password) {
    loginUser(req.body.name, req.body.password)
      .then((user) => {
        req.session.set("name", user.name)
        req.session.save().then(() => {
          res.status(200).json({ message: "Connection établie." })
        })
      })
      .catch((err) => {
        res.status(401).json({ message: err.message })
      })
  } else {
    res.status(400).json({ message: "Mauvaise requête." })
  }
})
