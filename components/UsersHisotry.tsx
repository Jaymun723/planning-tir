import { UserHistory } from "../lib/usersHistory"
import { WEEK_DAYS, PLACES, PLACES_MAP } from "../lib/consts"
import moment from "moment"

moment.locale("fr")

export const UsersHistory = ({ usersHistory }: { usersHistory: UserHistory[] }) => {
  return (
    <table className="users-history">
      <thead>
        <tr>
          <td className="coin" />
          {WEEK_DAYS.map((id) => (
            <th scope="col" colSpan={2} key={id}>
              {moment().weekday(id).format("dddd")}
            </th>
          ))}
        </tr>
        <tr>
          <td>Tireurs</td>
          {WEEK_DAYS.map((id) => {
            const Places = () => {
              return (
                <>
                  {PLACES.map((id) => (
                    <td scope="col" key={id}>
                      Réservation {PLACES_MAP[id].name}
                    </td>
                  ))}
                </>
              )
            }

            return <Places key={id} />
          })}
        </tr>
      </thead>
      <tbody>
        {usersHistory.map((userHistory) => (
          <tr key={userHistory.name}>
            <th scope="row">{userHistory.name}</th>
            {userHistory.days.map((day) => {
              const Day = ({ day }: { day: UserHistory["days"][0] }) => {
                return (
                  <>
                    {day.places.map((place) => (
                      <td key={place.id}>
                        Réservation: {place.asked}h<br />
                        Acceptée: {place.accepted}h<br />
                        Refusée: {place.refused}h
                      </td>
                    ))}
                  </>
                )
              }

              return <Day key={day.id} day={day} />
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
