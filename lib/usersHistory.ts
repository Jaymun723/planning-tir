import { connectToDb } from "./mongo"
import { Week } from "./planningDb"
import { User } from "./userDb"
import { WEEK_DAYS, PLACES, START_HOURS } from "./consts"

export interface UserHistory {
  name: string
  days: {
    id: number
    places: {
      id: number
      asked: number
      accepted: number
      refused: number
    }[]
  }[]
}

export const getUsersHistory = async () => {
  const { db } = await connectToDb()

  const weeksCollection = db.collection<Week>("weeks")
  const usersCollection = db.collection<User>("users")

  const dbUsers = (await usersCollection.find({}).toArray()).sort((a, b) => {
    const user1 = a.name.toUpperCase()
    const user2 = b.name.toUpperCase()
    if (user1 < user2) {
      return -1
    }
    if (user1 > user2) {
      return 1
    }
    return 0
  })

  const users: UserHistory[] = dbUsers.map((user) => ({
    name: user.name,
    days: WEEK_DAYS.map((id) => ({
      id,
      places: PLACES.map((id) => ({
        id,
        asked: 0,
        accepted: 0,
        refused: 0,
      })),
    })),
  }))

  const weeks = await weeksCollection.find({}).toArray()

  for (const week of weeks) {
    for (const day of week.days) {
      for (const hour of day.hours) {
        for (const place of hour.places) {
          for (const invoice of place.value) {
            let user = users.find((u) => u.name === invoice.userName)

            if (!user) continue

            user.days = user.days.map((userDay) => {
              if (userDay.id !== day.id) return userDay

              return {
                id: userDay.id,
                places: userDay.places.map((userPlace) => {
                  if (userPlace.id !== place.id) return userPlace

                  return {
                    id: userPlace.id,
                    accepted: invoice.validated ? userPlace.accepted + 1 : userPlace.accepted,
                    asked: userPlace.asked + 1,
                    refused: invoice.validated === false ? userPlace.refused + 1 : userPlace.refused,
                  }
                }),
              }
            })
          }
        }
      }
    }
  }

  return users
}
