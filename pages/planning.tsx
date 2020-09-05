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
      <div>
        <p>Ce planning vous permet de réserver des créneaux pour le stand 10m.</p>
        <p>Vous pouvez réserver par créneau d'une heure. Vous pouvez réserver plusieurs créneaux sur 2 semaines</p>
        <p>
          Il y a 6 places pour la précision (carabine / pistolet) et 1 place pour la vitesse pistolet, par séance d'une
          heure.
        </p>
      </div>
      <Planning
        planning={planning}
        displayCell={({ day, hour, week, place }) => {
          const Infos = () => (
            <>
              <br />
              {place.waiting} en attente
              <br />
              {place.accepted} approuvé
            </>
          )

          const reserve = () => {
            fetch("/api/planning/reserve", {
              headers: { "Content-Type": "application/json" },
              method: "POST",
              body: JSON.stringify({
                day: day.id,
                hour: hour.id,
                place: place.id,
                week: week.id,
              }),
            }).then((res) => {
              if (res.status === 200) {
                refetch()
              } else {
                res.json().then(console.log)
              }
            })
          }

          if (place.value !== null) {
            const { validated } = place.value
            if (validated === true) {
              return () => (
                <td key={`${week.id}-${day.id}-${hour.id}`} className="approuve">
                  <span className="big">Approuvé</span>
                  <Infos />
                </td>
              )
            } else if (validated === false) {
              return () => (
                <td key={`${week.id}-${day.id}-${hour.id}`} className="refuse">
                  <span className="big">Refusé</span>
                  <Infos />
                </td>
              )
            } else {
              return () => (
                <td key={`${week.id}-${day.id}-${hour.id}`} className="attente" onClick={reserve}>
                  <span className="big">En attente</span>
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
      <div className="text">
        <div>
          <h2>Pour réserver :</h2>
          <ol>
            <li>
              <p>Cliquer sur une case de réservation (blanche)</p>
            </li>
            <li>
              <p>La réservation s'affiche en orange</p>
            </li>
            <li>
              <p>Après confirmation:</p>
              <ul>
                <li>
                  <p>Si la case est verte: la réservation est confirmée pour cette date et heure</p>
                </li>
                <li>
                  <p>Si la case est rouge: la réservation n'est pas validé pour cette date et heure</p>
                </li>
              </ul>
            </li>
          </ol>
        </div>
        <div>
          <h2 className="red">Veuillez réserver :</h2>
          <ul className="red">
            <li>
              <p>Pour les créneaux mercredi, avant le lundi soir à minuit</p>
            </li>
            <li>
              <p>Pour les créneaux du dimanche, avant le vendredi soir à minuit</p>
            </li>
          </ul>
          <p>Après ces dates (lundi soir et vendredi soir), les réservations ne seront pas prises en compte.</p>
        </div>
        <div>
          <h2>La confirmation ou non de vos réservations est terminée au plus tard :</h2>
          <ul>
            <li>
              <p>Pour les créneaux du mercredi, avant le mardi soir à minuit</p>
            </li>
            <li>
              <p>Pour les créneaux du dimanche, avant le samedi soir à minuit</p>
            </li>
          </ul>
        </div>
        <div>
          <p>
            Pour toute information complémentaire, ou problème de réservation, vous pouvez poser vos questions{" "}
            <a href="https://www.ctpal.fr/page/445112-contact" target="_blank">
              ici
            </a>
            .
          </p>
          <h3>Remarque :</h3>
          <p>Sur une réservation en attente, ou approuvé, l'utilisateur peut se désinscrire.</p>
        </div>
      </div>
    </div>
  )
}

export default PlanningPage
