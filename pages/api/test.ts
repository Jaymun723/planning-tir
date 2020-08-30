import { withSession, ApiRequest } from "../../lib/session"
import { NextApiResponse } from "next"
import { connectToDb } from "../../lib/mongo"

export default withSession(async (req: ApiRequest, res: NextApiResponse) => {
  const { client, db } = await connectToDb()

  res.status(200).json({ message: "ok" })
})
