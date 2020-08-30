import { useApi } from "../lib/useApi"
import { Week } from "../lib/planningDb"
import { Planning } from "../components/Planning"
import Router from "next/router"

const AdminPage = () => {
  const [planning, refetch] = useApi<{ weeks: Week[] }>("/api/planning/admin", { redirectWhenFail: "/" })

  if (!planning) {
    return <div>Chargement...</div>
  }

  const setApproval = (weekNumber: number, dayNumber: number, startHour: number) => (
    userName: string,
    approval: boolean
  ) => () => {
    fetch("/api/planning/gestion", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        userName,
        approval,
        weekNumber: String(weekNumber),
        dayNumber: String(dayNumber),
        startHour: String(startHour),
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
    <div>
      <Planning
        planning={planning}
        displayCell={({ dayNumber, startHour, value, weekNumber }) => {
          const approvalFn = setApproval(weekNumber, dayNumber, startHour)
          return () => (
            <td key={`${weekNumber}-${dayNumber}-${startHour}`}>
              <div className="utilisateurs">
                {value.map(({ userName, validated }) => (
                  <div className="utilisateur" key={userName}>
                    {userName}
                    <button className={validated === true ? "valide" : undefined} onClick={approvalFn(userName, true)}>
                      Valider
                    </button>
                    <button
                      className={validated === false ? "refuse" : undefined}
                      onClick={approvalFn(userName, false)}
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
