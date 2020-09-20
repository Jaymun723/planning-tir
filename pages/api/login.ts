import { sign } from "jsonwebtoken"
import { NextApiRequest, NextApiResponse } from "next"
import { loginUser } from "../../lib/userDb"

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.body.name && req.body.password) {
    loginUser(req.body.name, req.body.password)
      .then((user) => {
        const token = sign({ name: user.name, isAdmin: user.isAdmin }, process.env.SECRET_COOKIE_PASSWORD!)
        res.status(200).json({ message: "Connection établie.", token })
      })
      .catch((err) => {
        res.status(401).json({ message: err.message })
      })
  } else {
    res.status(400).json({ message: "Mauvaise requête." })
  }
}
