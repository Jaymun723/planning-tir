import Router from "next/router"
import { useState } from "react"
import Head from "next/head"

const Index = () => {
  const [error, setError] = useState("")

  return (
    <div className="page">
      <Head>
        <title>Connection | Planning stand de tir 10m Palaiseau</title>
      </Head>
      <h1>Planning de réservation des séances du mercredi et dimanche au stand de tir 10m Palaiseau</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const target = e.target as typeof e.target & {
            name: { value: string }
            password: { value: string }
          }
          fetch("/api/login", {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ name: target.name.value, password: target.password.value }),
          }).then((res) => {
            if (res.status === 200) {
              Router.push("/planning")
            } else {
              res.json().then((err) => setError(err.message))
            }
          })
        }}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {error && (
          <p>
            {error}
            <br />
            <button onClick={() => setError("")}>X</button>
          </p>
        )}
        <label htmlFor="name">Nom:</label>
        <input type="text" name="name" />
        <label htmlFor="password">Mot de passe:</label>
        <input type="password" name="password" />
        <input type="submit" value="Connection" />
      </form>
    </div>
  )
}

export default Index
