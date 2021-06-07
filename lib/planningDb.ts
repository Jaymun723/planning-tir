import { connectToDb } from "./mongo"
import { WEEK_DAYS, START_HOURS, PLACES, PLACES_MAP } from "./consts"

export interface WeekBase<T> {
  id: number
  days: {
    id: number
    hours: {
      id: number
      places: {
        id: number
        value: T
        max: number
        waiting: number
        accepted: number
      }[]
    }[]
  }[]
}

interface UserInvoice {
  userName: string
  validated: boolean | null
}

export type Week = WeekBase<UserInvoice[]>
export type UserWeek = WeekBase<{ validated: boolean | null } | null>

const createWeek = async (weekNumber: number) => {
  const { db } = await connectToDb()

  const week: Week = {
    id: weekNumber,
    days: WEEK_DAYS.map((id) => ({
      id,
      hours: START_HOURS[id].map((id) => ({
        id,
        places: PLACES.map((id) => ({
          id,
          value: [] as UserInvoice[],
          waiting: 0,
          accepted: 0,
          max: PLACES_MAP[id].max,
        })),
      })),
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
            return {
              id: hour.id,
              places: hour.places.map((place) => {
                const value = place.value.find((user) => user.userName === userName)
                return {
                  id: place.id,
                  accepted: place.accepted,
                  waiting: place.waiting,
                  value: value ? { validated: value.validated } : null,
                  max: place.max,
                }
              }),
            }
            // const value = hour.value.find((user) => user.userName === userName)
            // return {
            //   id: hour.id,
            //   accepted: hour.accepted,
            //   waiting: hour.waiting,
            //   value: value ? { validated: value.validated } : null,
            // }
          }),
        }
      }),
    }
  })

  return res
}

interface SetReservationOptions {
  name: string
  week: number
  day: number
  hour: number
  place: number
}
export const setReservation = async (ops: SetReservationOptions) => {
  const { db } = await connectToDb()

  const weeksCollection = db.collection<Week>("weeks")

  let week = await weeksCollection.findOne({ id: ops.week })
  if (!week) {
    throw new Error("Impossible de trouver cette semaine.")
  }

  let day = week.days.find((day) => day.id === ops.day)
  if (!day) {
    throw new Error("Ce jour n'est pas disponible dans cette semaine.")
  }

  let hour = day.hours.find((hour) => hour.id === ops.hour)
  if (!hour) {
    throw new Error("Cette heure n'est pas disponible à ce jour.")
  }

  let place = hour.places.find((place) => place.id === ops.place)
  if (!place) {
    throw new Error("Cette place n'éxiste pas.")
  }

  let user = place.value.find((user) => user.userName === ops.name)
  if (!user) {
    place.waiting++
    place.value.push({ userName: ops.name, validated: null })
  } else if (user.validated === null) {
    place.waiting = Math.max(0, place.waiting - 1)
    place.value = place.value.filter((user) => user.userName !== ops.name)
  } else if (user.validated === true) {
    place.accepted = Math.max(0, place.waiting - 1)
    place.value = place.value.filter((user) => user.userName !== ops.name)
  } else if (user.validated === false) {
    place.accepted = Math.max(0, place.waiting - 1)
    place.value = place.value.filter((user) => user.userName !== ops.name)
  }

  await weeksCollection.updateOne({ id: ops.week }, { $set: { days: week.days } })
}

interface SetApprovalOptions extends SetReservationOptions {
  approval: boolean
}
export const setApproval = async (ops: SetApprovalOptions) => {
  const { db } = await connectToDb()

  const weeksCollection = db.collection<Week>("weeks")

  let week = await weeksCollection.findOne({ id: ops.week })
  if (!week) {
    throw new Error("Impossible de trouver cette semaine.")
  }

  let day = week.days.find((day) => day.id === ops.day)
  if (!day) {
    throw new Error("Ce jour n'est pas disponible dans cette semaine.")
  }

  let hour = day.hours.find((hour) => hour.id === ops.hour)
  if (!hour) {
    throw new Error("Cette heure n'est pas disponible à ce jour.")
  }

  let place = hour.places.find((place) => place.id === ops.place)
  if (!place) {
    throw new Error("Cette place n'éxiste pas.")
  }

  let user = place.value.find((user) => user.userName === ops.name)
  if (!user) {
    throw new Error("Impossible de trouver cet utilisateur.")
  }

  if (user.validated !== ops.approval) {
    if (user.validated === null) {
      place.waiting--
      if (ops.approval) {
        place.accepted++
      }
    } else if (ops.approval) {
      place.accepted++
    } else {
      place.accepted--
    }
  }
  user.validated = ops.approval

  await weeksCollection.updateOne({ id: ops.week }, { $set: { days: week.days } })
}
