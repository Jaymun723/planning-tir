import { withIronSession } from "next-iron-session"
import { NextApiRequest } from "next"

export interface ApiRequest extends NextApiRequest {
  session: {
    set(name: string, value: string): void
    get(name: string): string
    unset(name: string): void
    save(): Promise<void>
    destroy(): void
  }
}

export const withSession = (handler: any) => {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD!,
    cookieName: "planning-tir",
    cookieOptions: {
      // the next line allows to use the session in non-https environments like
      // Next.js dev mode (http://localhost:3000)
      secure: process.env.NODE_ENV === "production" ? true : false,
    },
  })
}
