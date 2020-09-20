import { NextApiRequest, NextApiResponse } from "next"
import { verify } from "jsonwebtoken"

export const authUser = (req: NextApiRequest) => {
  const token = req.headers.authorization
  if (!token) {
    return
  }
  try {
    const payload = verify(token, process.env.SECRET_COOKIE_PASSWORD!) as { name: string; isAdmin: boolean }
    return payload
  } catch (error) {
    return
  }
}
