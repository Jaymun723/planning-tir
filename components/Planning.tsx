import { WeekBase } from "../lib/planningDb"
import moment from "moment"

moment.locale("fr")

interface PlanningProps<T> {
  planning: {
    weeks: WeekBase<T>[]
  }
  displayCell: (props: { weekNumber: number; dayNumber: number; startHour: number; value: T }) => React.ComponentType
}
export function Planning<T>({ planning, displayCell }: PlanningProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          <td className="coin" />
          {planning.weeks.map((week) => (
            <th colSpan={Object.keys(week.days).length} scope="col" key={week.weekNumber}>
              Semaine {week.weekNumber}
            </th>
          ))}
        </tr>
        <tr>
          <td className="coin" />
          {planning.weeks.map((week) => {
            return Object.keys(week.days).map((dayNumber) => {
              const date = moment().week(week.weekNumber).weekday(Number(dayNumber))
              return (
                <th scope="col" key={`${dayNumber}-${week.weekNumber}`}>
                  {date.format("dddd Do")}
                </th>
              )
            })
          })}
        </tr>
      </thead>
      <tbody>
        {planning.weeks
          .reduce((prev, week) => {
            const startHours = Object.values(week.days).flatMap((day) => Object.keys(day).map(Number))
            return [...new Set([...prev, ...startHours])]
          }, [] as number[])
          .map((startHour) => {
            return (
              <tr key={startHour.toString()}>
                <th scope="row">
                  {startHour}h-{startHour + 1}h
                </th>
                {planning.weeks.map((week) => {
                  return Object.entries(week.days).map(([dayNumber, day]) => {
                    const Cell = displayCell({
                      value: day[startHour],
                      weekNumber: week.weekNumber,
                      dayNumber: Number(dayNumber),
                      startHour,
                    })
                    return <Cell />
                  })
                })}
              </tr>
            )
          })}
      </tbody>
    </table>
  )
}
