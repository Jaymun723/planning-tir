import { useApi } from "../lib/useApi"
import { Week } from "../lib/planningDb"
import { Planning } from "../components/Planning"
import Router from "next/router"
import Head from "next/head"
import { UsersHistory } from "../components/UsersHisotry"
import { UserHistory } from "../lib/usersHistory"

const AdminPage = () => {
  const [planning, refetch] = useApi<{ weeks: Week[]; users: UserHistory[] }>("/api/planning/admin", {
    redirectWhenFail: "/",
  })

  if (!planning) {
    return <div>Chargement...</div>
  }

  const setApproval = (weekNumber: number, dayNumber: number, startHour: number) => (
    userName: string,
    approval: boolean,
    placeNumber: number
  ) => () => {
    fetch("/api/planning/gestion", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        approval,
        day: dayNumber,
        hour: startHour,
        name: userName,
        place: placeNumber,
        week: weekNumber,
      }),
    }).then((res) => {
      if (res.status === 200) {
        refetch()
      } else {
        res.json().then((err) => console.log(err))
      }
    })
  }

  return (
    <div className="page">
      <Head>
        <title>Admin | Planning stand de tir 10m Palaiseau</title>
      </Head>
      <Planning
        planning={planning}
        displayCell={({ day, hour, week, place }) => {
          const approvalFn = setApproval(week.id, day.id, hour.id)
          return () => (
            <td key={`${week.id}-${day.id}-${hour.id}`}>
              <div className="utilisateurs">
                {place.value.map(({ userName, validated }) => (
                  <div className="utilisateur" key={userName}>
                    {userName}
                    <button
                      className={validated === true ? "valide" : undefined}
                      onClick={approvalFn(userName, true, place.id)}
                    >
                      Valider
                    </button>
                    <button
                      className={validated === false ? "refuse" : undefined}
                      onClick={approvalFn(userName, false, place.id)}
                    >
                      Refuser
                    </button>
                  </div>
                ))}
              </div>
            </td>
          )
        }}
      />
      <UsersHistory usersHistory={planning.users} />
      <button
        onClick={() => {
          Router.push("/planning")
        }}
      >
        Retour
      </button>
    </div>
  )
}

export default AdminPage
