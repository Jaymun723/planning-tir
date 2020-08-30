import { WeekBase } from "../lib/planningDb"
import moment from "moment"
import planning from "../pages/api/planning"
import { useMemo } from "react"

moment.locale("fr")

interface PlanningProps<T> {
  planning: {
    weeks: WeekBase<T>[]
  }
  displayCell: (props: {
    week: WeekBase<T>
    day: WeekBase<T>["days"][0]
    hour: WeekBase<T>["days"][0]["hours"][0]
  }) => React.ComponentType
}

const getHours = (weeks: WeekBase<any>[]) => [
  ...new Set(weeks.flatMap((week) => week.days.flatMap((day) => day.hours.map((hour) => hour.id)))),
]

export function Planning<T>({ planning, displayCell }: PlanningProps<T>) {
  const startHours = useMemo(() => getHours(planning.weeks), [planning])

  return (
    <table>
      <thead>
        <tr>
          <td className="coin"></td>
          {planning.weeks.map((week) => {
            return (
              <th colSpan={week.days.length} scope="col" key={week.id}>
                Semaine {week.id}
              </th>
            )
          })}
        </tr>
        <tr>
          <td className="coin"></td>
          {planning.weeks.map((week) => {
            const Days = () => {
              return (
                <>
                  {week.days.map((day) => {
                    const date = moment().week(week.id).weekday(day.id)
                    return <th key={day.id}>{date.format("dddd Do")}</th>
                  })}
                </>
              )
            }
            return <Days key={week.id} />
          })}
        </tr>
      </thead>
      <tbody>
        {startHours.map((hour) => (
          <tr key={hour}>
            <th scope="row">
              {hour}h-{hour + 1}h
            </th>
            {planning.weeks.map((week) => {
              const Days = () => {
                return (
                  <>
                    {week.days.map((day) => {
                      const Cell = displayCell({
                        week: week,
                        day: day,
                        hour: day.hours.find((h) => h.id === hour)!,
                      })
                      return <Cell key={day.id} />
                    })}
                  </>
                )
              }
              return <Days key={week.id} />
            })}
          </tr>
        ))}
      </tbody>
    </table>
    // <table>
    //   <thead>
    //     <tr>
    //       <td className="coin" />
    //       {planning.weeks.map((week) => (
    //         <th colSpan={Object.keys(week.days).length} scope="col" key={week.weekNumber}>
    //           Semaine {week.weekNumber}
    //         </th>
    //       ))}
    //     </tr>
    //     <tr>
    //       <td className="coin" />
    //       {planning.weeks.map((week) => {
    //         return Object.keys(week.days).map((dayNumber) => {
    //           const date = moment().week(week.weekNumber).weekday(Number(dayNumber))
    //           return (
    //             <th scope="col" key={`${dayNumber}-${week.weekNumber}`}>
    //               {date.format("dddd Do")}
    //             </th>
    //           )
    //         })
    //       })}
    //     </tr>
    //   </thead>
    //   <tbody>
    //     {planning.weeks
    //       .reduce((prev, week) => {
    //         const startHours = Object.values(week.days).flatMap((day) => Object.keys(day).map(Number))
    //         return [...new Set([...prev, ...startHours])]
    //       }, [] as number[])
    //       .map((startHour) => {
    //         return (
    //           <tr key={startHour.toString()}>
    //             <th scope="row">
    //               {startHour}h-{startHour + 1}h
    //             </th>
    //             {planning.weeks.map((week) => {
    //               return Object.entries(week.days).map(([dayNumber, day]) => {
    //                 const Cell = displayCell({
    //                   value: day[startHour],
    //                   weekNumber: week.weekNumber,
    //                   dayNumber: Number(dayNumber),
    //                   startHour,
    //                 })
    //                 return <Cell />
    //               })
    //             })}
    //           </tr>
    //         )
    //       })}
    //   </tbody>
    // </table>
  )
}
