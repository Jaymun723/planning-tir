import { useApi } from "../lib/useApi"
import { User } from "../lib/userDb"
import { UserWeek } from "../lib/planningDb"
import moment from "moment"
import { Planning } from "../components/Planning"
import Router from "next/router"
import Head from "next/head"

moment.locale("fr")

const PlanningPage = () => {
  const [planning, refetch] = useApi<{ weeks: UserWeek[] }>("/api/planning", { redirectWhenFail: "/" })
  const [data] = useApi<{ user: User }>("/api/user")

  if (!planning) {
    return <div>Chargement...</div>
  }

  return (
    <div className="page">
      <Head>
        <title>Planning stand de tir 10m Palaiseau</title>
      </Head>
      <Planning
        planning={planning}
        displayCell={({ day, hour, week }) => {
          const Infos = () => (
            <>
              <br />
              {hour.waiting} en attente
              <br />
              {hour.accepted} approuvé
            </>
          )

          const reserve = () => {
            fetch("/api/planning/reserve", {
              headers: { "Content-Type": "application/json" },
              method: "POST",
              body: JSON.stringify({
                weekNumber: String(week.id),
                dayNumber: String(day.id),
                startHour: String(hour.id),
              }),
            }).then((res) => {
              if (res.status === 200) {
                refetch()
              } else {
                console.log(res.json())
              }
            })
          }

          if (hour.value !== null) {
            const { validated } = hour.value
            if (validated === true) {
              return () => (
                <td key={`${week.id}-${day.id}-${hour.id}`} className="approuve">
                  Approuvé
                  <Infos />
                </td>
              )
            } else if (validated === false) {
              return () => (
                <td key={`${week.id}-${day.id}-${hour.id}`} className="refuse">
                  Refusé
                  <Infos />
                </td>
              )
            } else {
              return () => (
                <td key={`${week.id}-${day.id}-${hour.id}`} className="attente" onClick={reserve}>
                  En attente
                  <Infos />
                </td>
              )
            }
          } else {
            return () => (
              <td key={`${week.id}-${day.id}-${hour.id}`} className="reservation" onClick={reserve}>
                Réservez
                <Infos />
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
