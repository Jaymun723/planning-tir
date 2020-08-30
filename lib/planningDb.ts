import * as fs from "fs/promises"
import * as path from "path"
import moment from "moment"
import { type } from "os"

moment.locale("fr")

interface WeekBase<T> {
  weekNumber: number
  days: {
    [weekDay: number]: {
      [startHour: number]: T
    }
  }
}

export type Week = WeekBase<{ userName: string; validated: boolean | null }[]>
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
    weekNumber,
    days: WEEK_DAYS.reduce(
      (prev, i) => ({ ...prev, [i]: START_HOURS.reduce((prev, i) => ({ ...prev, [i]: [] }), {}) }),
      {}
    ),
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

  for (const i in dbWeeks) {
    const week = dbWeeks[i]
    for (const dayNumber in week.days) {
      const day = week.days[dayNumber]
      for (const startHour in day) {
        const validation = day[startHour].find((user) => user.userName === userName)
        dbWeeks[i].days[dayNumber] = {
          ...dbWeeks[i].days[dayNumber],
          [startHour]: validation ? { validated: validation.validated } : null,
        }
      }
    }
  }

  return dbWeeks
}
