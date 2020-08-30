import { useApi } from "../lib/useApi"
import { User } from "../lib/userDb"
import { UserWeek } from "../lib/planningDb"
import moment from "moment"
import { Planning } from "../components/Planning"
import Router from "next/router"

moment.locale("fr")

const PlanningPage = () => {
  const [planning, refetch] = useApi<{ weeks: UserWeek[] }>("/api/planning", { redirectWhenFail: "/" })
  const [data] = useApi<{ user: User }>("/api/user")

  if (!planning) {
    return <div>Chargement...</div>
  }

  return (
    <div>
      <Planning
        planning={planning}
        displayCell={({ dayNumber, startHour, value, weekNumber }) => {
          if (value !== null) {
            const { validated } = value
            if (validated === true) {
              return () => (
                <td key={`${weekNumber}-${dayNumber}-${startHour}`} className="approuve">
                  Approuvé
                </td>
              )
            } else if (validated === false) {
              return () => (
                <td key={`${weekNumber}-${dayNumber}-${startHour}`} className="refuse">
                  Refusé
                </td>
              )
            } else {
              return () => (
                <td key={`${weekNumber}-${dayNumber}-${startHour}`} className="attente">
                  En attente
                </td>
              )
            }
          } else {
            return () => (
              <td
                key={`${weekNumber}-${dayNumber}-${startHour}`}
                className="reservation"
                onClick={() => {
                  fetch("/api/planning/reserve", {
                    headers: { "Content-Type": "application/json" },
                    method: "POST",
                    body: JSON.stringify({
                      weekNumber: String(weekNumber),
                      dayNumber: String(dayNumber),
                      startHour: String(startHour),
                    }),
                  }).then((res) => {
                    if (res.status === 200) {
                      refetch()
                    } else {
                      console.log(res.json())
                    }
                  })
                }}
              >
                Réservez
              </td>
            )
          }
        }}
      />
      <div>
        {data?.user && (
          <>
            <p>Connecté en tant que {data.user.name}.</p>
            {data.user.isAdmin && (
              <button
                onClick={() => {
                  Router.push("/admin")
                }}
              >
                Aller sur la page administrateur
              </button>
            )}
          </>
        )}
        <button
          onClick={() => {
            fetch("/api/logout").then(() => {
              Router.push("/")
            })
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

export default PlanningPage
