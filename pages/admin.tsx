import { useApi } from "../lib/useApi"
import { Week } from "../lib/planningDb"
import { Planning } from "../components/Planning"
import Router from "next/router"
import Head from "next/head"
import { UsersHistory } from "../components/UsersHisotry"
import { UserHistory } from "../lib/usersHistory"
import { useEffect, useState } from "react"

interface Verification {
  approval: boolean
  day: number
  hour: number
  name: string
  place: number
  week: number
}

const AdminPage = () => {
  const [planningData, refetch, loading] = useApi<{ weeks: Week[]; users: UserHistory[] }>("/api/planning/admin", {
    redirectWhenFail: "/",
  })
  const [weeks, setWeeks] = useState([] as Week[])
  const [verifications, setVerifications] = useState([] as Verification[])

  useEffect(() => {
    if (planningData?.weeks) {
      setWeeks(planningData.weeks)
    }
  }, [planningData])

  if (!planningData) {
    return <div>Chargement...</div>
  }

  const setApproval = (weekNumber: number, dayNumber: number, startHour: number) => (
    userName: string,
    approval: boolean,
    placeNumber: number
  ) => () => {
    const stateVerifications = JSON.parse(JSON.stringify(verifications)) as Verification[]
    let verif = stateVerifications.find((a) => {
      if (
        a.day === dayNumber &&
        a.hour === startHour &&
        a.name === userName &&
        a.place === placeNumber &&
        a.week === weekNumber
      ) {
        return true
      }
      return false
    })
    if (verif) {
      verif.approval = approval
    } else {
      stateVerifications.push({
        approval,
        day: dayNumber,
        hour: startHour,
        name: userName,
        place: placeNumber,
        week: weekNumber,
      })
    }
    setVerifications(stateVerifications)

    // local state
    let stateWeeks = JSON.parse(JSON.stringify(weeks)) as Week[]

    let week = stateWeeks.find((week) => week.id === weekNumber)
    if (!week) {
      console.error("Impossible de trouver cette semaine.")
      return
    }

    let day = week.days.find((day) => day.id === dayNumber)
    if (!day) {
      console.error("Ce jour n'est pas disponible dans cette semaine.")
      return
    }

    let hour = day.hours.find((hour) => hour.id === startHour)
    if (!hour) {
      console.error("Cette heure n'est pas disponible à ce jour.")
      return
    }

    let place = hour.places.find((place) => place.id === placeNumber)
    if (!place) {
      console.error("Cette place n'éxiste pas.")
      return
    }

    let user = place.value.find((user) => user.userName === userName)
    if (!user) {
      console.error("Impossible de trouver cet utilisateur.")
      return
    }

    if (user.validated !== approval) {
      if (user.validated === null) {
        place.waiting--
        if (approval) {
          place.accepted++
        }
      } else if (approval) {
        place.accepted++
      } else {
        place.accepted--
      }
    }
    user.validated = approval

    setWeeks(stateWeeks)
  }

  return (
    <div className={`page${loading ? " loading" : ""}`}>
      <Head>
        <title>Admin | Planning stand de tir 10m Palaiseau</title>
      </Head>
      <Planning
        planning={{ weeks }}
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
      <div>
        <button
          disabled={verifications.length === 0}
          onClick={() => {
            setWeeks(planningData.weeks)
            setVerifications([])
          }}
        >
          Annuler les changements
        </button>
        <button
          onClick={() => {
            const ok = confirm(
              "Êtes vous sûr d'enregistrer les changements ?\nCela enverra un mail aux personnes concernées."
            )
            if (!ok) return
            fetch("/api/planning/gestion", {
              headers: { "Content-Type": "application/json", authorization: localStorage.getItem("token")! },
              method: "POST",
              body: JSON.stringify({ approvals: verifications }),
            }).then((res) => {
              if (res.status === 200) {
                refetch()
              } else {
                res.json().then((err) => console.log(err))
              }
            })
          }}
        >
          Enregistrer les changements
        </button>
      </div>
      <button
        onClick={() => {
          Router.push("/planning")
        }}
      >
        Retour
      </button>
      <UsersHistory usersHistory={planningData.users} />
    </div>
  )
}

export default AdminPage
