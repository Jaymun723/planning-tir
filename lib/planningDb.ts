// import * as fs from "fs/promises"
// import * as path from "path"
import moment from "moment"
import { connectToDb } from "./mongo"

moment.locale("fr")

export interface WeekBase<T> {
  id: number
  days: { id: number; hours: { id: number; value: T; waiting: number; accepted: number }[] }[]
}

interface UserInvoice {
  userName: string
  validated: boolean | null
}

export type Week = WeekBase<UserInvoice[]>
export type UserWeek = WeekBase<{ validated: boolean | null } | null>

const WEEK_DAYS = [
  // 0, // lundi
  // 1, // mardi
  2, // mercredi,
  // 3, // jeudi
  // 4, // vendredi
  // 5, // samedi
  6, // dimanche
]

const START_HOURS = [10, 11, 12]

const createWeek = async (weekNumber: number) => {
  const { db } = await connectToDb()

  const week: Week = {
    id: weekNumber,
    days: WEEK_DAYS.map((id) => ({
      id,
      hours: START_HOURS.map((id) => ({ id, value: [] as UserInvoice[], waiting: 0, accepted: 0 })),
      places: 0,
    })),
  }

  const weeksCollection = db.collection<Week>("weeks")

  await weeksCollection.insertOne(week)

  return week
}

export const getWeeks = async (weekNumbers: number[]) => {
  const { db } = await connectToDb()

  const weeks: Week[] = []

  const weeksCollection = db.collection<Week>("weeks")

  for (const weekNumber of weekNumbers) {
    let week = await weeksCollection.findOne({ id: weekNumber })
    if (!week) {
      week = await createWeek(weekNumber)
    }
    weeks.push(week)
  }

  return weeks
}

export const getWeeksForUser = async (userName: string, weekNumbers: number[]) => {
  const dbWeeks = await getWeeks(weekNumbers)

  const res: UserWeek[] = dbWeeks.map((week) => {
    return {
      id: week.id,
      days: week.days.map((day) => {
        return {
          id: day.id,
          hours: day.hours.map((hour) => {
            const value = hour.value.find((user) => user.userName === userName)
            return {
              id: hour.id,
              accepted: hour.accepted,
              waiting: hour.waiting,
              value: value ? { validated: value.validated } : null,
            }
          }),
        }
      }),
    }
  })

  return res
}

export const setReservation = async (userName: string, weekNumber: number, dayNumber: number, startHour: number) => {
  const { db } = await connectToDb()

  const weeksCollection = db.collection<Week>("weeks")

  let week = await weeksCollection.findOne({ id: weekNumber })
  if (!week) {
    throw new Error("Impossible de trouver cette semaine.")
  }

  let day = week.days.find((day) => day.id === dayNumber)
  if (!day) {
    throw new Error("Ce jour n'est pas disponible dans cette semaine.")
  }

  let hour = day.hours.find((hour) => hour.id === startHour)
  if (!hour) {
    throw new Error("Cette heure n'est pas disponible à ce jour.")
  }

  let user = hour.value.find((user) => user.userName === userName)
  if (!user) {
    hour.waiting++
    hour.value.push({ userName, validated: null })
  } else {
    hour.waiting--
    hour.value = hour.value.filter((user) => user.userName !== userName)
  }

  await weeksCollection.updateOne({ id: weekNumber }, { $set: { days: week.days } })
}

export const setApproval = async (
  userName: string,
  approval: boolean,
  weekNumber: number,
  dayNumber: number,
  startHour: number
) => {
  const { db } = await connectToDb()

  const weeksCollection = db.collection<Week>("weeks")

  let week = await weeksCollection.findOne({ id: weekNumber })
  if (!week) {
    throw new Error("Impossible de trouver cette semaine.")
  }

  let day = week.days.find((day) => day.id === dayNumber)
  if (!day) {
    throw new Error("Ce jour n'est pas disponible dans cette semaine.")
  }

  let hour = day.hours.find((hour) => hour.id === startHour)
  if (!hour) {
    throw new Error("Cette heure n'est pas disponible à ce jour.")
  }

  let user = hour.value.find((user) => user.userName === userName)
  if (!user) {
    throw new Error("Impossible de trouver cet utilisateur.")
  }

  if (user.validated !== approval) {
    if (user.validated === null) {
      hour.waiting--
      if (approval) {
        hour.accepted++
      }
    } else if (approval) {
      hour.accepted++
    } else {
      hour.accepted--
    }
  }
  user.validated = approval

  await weeksCollection.updateOne({ id: weekNumber }, { $set: { days: week.days } })
}
