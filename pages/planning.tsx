import { useApi } from "../lib/useUser"
import { User } from "../lib/userDb"
import { UserWeek } from "../lib/planningDb"
import moment from "moment"

moment.locale("fr")

const Planning = () => {
  const user = useApi<User>("/api/user", { redirectWhenFail: "/" })
  const planning = useApi<{ weeks: UserWeek[] }>("/api/planning")

  if (!user || !planning) {
    return <div>Chargement...</div>
  }

  return (
    <div>
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
            .map((startHour) => (
              <tr key={startHour}>
                <th scope="row">
                  {startHour}h-{startHour + 1}h
                </th>
                {planning.weeks.map((week) => {
                  return Object.entries(week.days).map(([dayNumber, day]) => {
                    console.log(day[startHour])
                    let Content
                    if (day[startHour] !== null) {
                      const { validated } = day[startHour]!
                      if (validated === true) {
                        Content = () => <p className="approuve">Approuvé</p>
                      } else if (validated === false) {
                        Content = () => <p className="refuse">Refusé</p>
                      } else {
                        Content = () => <p className="attente">En attente</p>
                      }
                    } else {
                      Content = () => <p className="reservation">Réservez</p>
                    }

                    return (
                      <td key={`${week.weekNumber}-${dayNumber}-${startHour}`}>
                        <Content />
                      </td>
                    )
                  })
                })}
              </tr>
            ))}
        </tbody>
        {/* {Object.keys(planning.weeks[0].days[6]).map((startHour) => (
          <tr>
            <th scope="row">
              {startHour}h-{Number(startHour) + 1}h
            </th>
          </tr>
        ))} */}
        {/* {planning.weeks.map((week) => (
          <>
            {Object.values(week.days).map((day, i, days) => {
              const startHours = Object.keys(day)
              return startHours.map((hour) => (
                <tr>
                  <th scope="row">
                    {hour}h-{Number(hour) + 1}h
                  </th>
                  {days.map(() => (
                    <td></td>
                  ))}
                </tr>
              ))
            })}
          </>
        ))} */}
      </table>
      {/* <table>
        <tr>
          <td></td>
          <th colSpan={2}>Semaine 35</th>
          <th colSpan={2}>Semaine 36</th>
        </tr>
        <tr>
          <td></td>
          <th scope="col">Mercredi 03</th>
          <th scope="col">Dimanche 07</th>
          <th scope="col">Mercredi 06</th>
          <th scope="col">Dimanche 14</th>
        </tr>
        <tr>
          <th scope="row">10h-11h</th>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th scope="row">11h-12h</th>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th scope="row">12h-13h</th>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </table> */}
    </div>
  )
}

export default Planning
