import * as fs from "fs/promises"
import * as path from "path"
import moment from "moment"

moment.locale("fr")

export interface WeekBase<T> {
  id: number
  days: { id: number; hours: { id: number; value: T }[]; places: number }[]
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

const createWeek = (weekNumber: number) => {
  const filePath = path.resolve(process.cwd(), "planning/", `week-${weekNumber}.json`)

  const week: Week = {
    id: weekNumber,
    days: WEEK_DAYS.map((id) => ({
      id,
      hours: START_HOURS.map((id) => ({ id, value: [] as UserInvoice[] })),
      places: 0,
    })),
  }

  return fs.writeFile(filePath, JSON.stringify(week), {
    encoding: "utf-8",
  })
}

export const getWeeks = async (weekNumbers: number[]) => {
  const weeks: Week[] = []
  for (const weekNumber of weekNumbers) {
    const filePath = path.join(process.cwd(), "planning/", `week-${weekNumber}.json`)

    const fileExist = await fs.stat(filePath).catch((err) => {})
    if (!fileExist) {
      await createWeek(weekNumber)
    }

    const file = await fs.readFile(filePath, {
      encoding: "utf-8",
    })
    weeks.push(JSON.parse(file))
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
          places: day.places,
          hours: day.hours.map((hour) => {
            const value = hour.value.find((user) => user.userName === userName)
            return {
              id: hour.id,
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
  const filePath = path.join(process.cwd(), "planning/", `week-${weekNumber}.json`)

  const file = await fs.readFile(filePath, { encoding: "utf-8" }).catch((err) => {})
  if (!file) {
    throw new Error("Impossible de trouver cette semaine.")
  }
  let week = JSON.parse(file) as Week

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
    hour.value.push({ userName, validated: null })
  }

  await fs.writeFile(filePath, JSON.stringify(week), { encoding: "utf-8" })
}

export const setApproval = async (
  userName: string,
  approval: boolean,
  weekNumber: number,
  dayNumber: number,
  startHour: number
) => {
  const filePath = path.join(process.cwd(), "planning/", `week-${weekNumber}.json`)

  const file = await fs.readFile(filePath, { encoding: "utf-8" }).catch((err) => {})
  if (!file) {
    throw new Error("Impossible de trouver cette semaine.")
  }
  let week = JSON.parse(file) as Week

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

  user.validated = approval

  await fs.writeFile(filePath, JSON.stringify(week), { encoding: "utf-8" })
}
