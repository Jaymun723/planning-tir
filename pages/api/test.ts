import { NextApiRequest, NextApiResponse } from "next"
import { sendMail } from "../../lib/mail"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await sendMail({
    content: "Test",
    subject: "Test",
    to: "jaymun723@yahoo.com",
  })
  res.json({ message: "ok" })
}
