import { WeekBase } from "../lib/planningDb"
import { PLACES_MAP } from "../lib/consts"
import moment from "moment"
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
    place: WeekBase<T>["days"][0]["hours"][0]["places"][0]
  }) => React.ComponentType
}

const getHours = (weeks: WeekBase<any>[]) =>
  [...new Set(weeks.flatMap((week) => week.days.flatMap((day) => day.hours.map((hour) => hour.id))))].sort()

export function Planning<T>({ planning, displayCell }: PlanningProps<T>) {
  const startHours = useMemo(() => getHours(planning.weeks), [planning])

  return (
    <table>
      <thead>
        <tr>
          <td className="coin" />
          <td className="coin" />
          {planning.weeks.map((week) => {
            const start = moment().week(week.id).weekday(0)
            const end = moment().week(week.id).weekday(6)
            return (
              <th colSpan={week.days.length} scope="col" key={week.id}>
                Semaine {week.id}
                <br />
                Du {start.format("Do MMMM")} au {end.format("Do MMMM")}
              </th>
            )
          })}
        </tr>
        <tr>
          <td className="coin"></td>
          <td>Type de place</td>
          {planning.weeks.map((week) => {
            const Days = () => {
              return (
                <>
                  {week.days.map((day) => {
                    const date = moment().week(week.id).weekday(day.id)
                    return <th key={day.id}>{date.format("dddd Do MMMM")}</th>
                  })}
                </>
              )
            }
            return <Days key={week.id} />
          })}
        </tr>
      </thead>
      <tbody>
        {startHours.map((startHour) => {
          const Days = ({ week, startHour, placeId }: { week: WeekBase<T>; startHour: number; placeId: number }) => {
            return (
              <>
                {week.days.map((day) => {
                  const hour = day.hours.find((h) => h.id === startHour)

                  if (!hour) {
                    return <td className="vide" key={day.id} />
                  }

                  const place = hour.places.find((p) => p.id === placeId)

                  if (!place) {
                    return <td className="vide" key={day.id} />
                  }

                  const Cell = displayCell({
                    week: week,
                    day: day,
                    hour,
                    place,
                  })
                  return <Cell key={day.id} />
                })}
              </>
            )
          }

          const StartHour = ({ id }: { id: number }) => {
            return (
              <>
                <tr>
                  <th scope="row" rowSpan={2}>
                    {startHour}h-{startHour + 1}h
                  </th>
                  <th>
                    {PLACES_MAP[0].name}: <br />
                    {PLACES_MAP[0].max} places au total
                  </th>
                  {planning.weeks.map((week) => (
                    <Days key={week.id} week={week} placeId={0} startHour={id} />
                  ))}
                </tr>
                <tr>
                  <th>
                    {PLACES_MAP[1].name}: <br />
                    {PLACES_MAP[1].max} place au total
                  </th>
                  {planning.weeks.map((week) => (
                    <Days key={week.id} week={week} placeId={1} startHour={id} />
                  ))}
                </tr>
              </>
            )
          }

          return <StartHour key={startHour} id={startHour} />
        })}
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
