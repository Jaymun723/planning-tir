import { withSession, ApiRequest } from "../../lib/session"
import { NextApiResponse } from "next"

export default withSession(async (req: ApiRequest, res: NextApiResponse) => {
  req.session.destroy()
  await req.session.save()
  res.status(200).json({ message: "ok" })
})
