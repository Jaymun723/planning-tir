import { connectToDb } from "./mongo"
import { compare } from "bcryptjs"

export interface User {
  name: string
  password: string
  isAdmin: boolean
}

export const loginUser = async (userName: string, userPassword: string) => {
  const { db } = await connectToDb()

  const usersCollection = db.collection<User>("users")

  const user = await usersCollection.findOne({ name: userName })

  if (!user) {
    throw new Error("Échec de la connection.")
  }

  const hashMatch = compare(userPassword, user.password)

  if (!hashMatch) {
    throw new Error("Échec de la connection.")
  }

  return user
}

export const getUser = async (name: string) => {
  const { db } = await connectToDb()

  const usersCollection = db.collection<User>("users")

  const user = await usersCollection.findOne({ name })

  return user
}
