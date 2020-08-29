const Index = () => {
  return (
    <div>
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
              console.log("yes !")
            } else {
              console.log("no !")
            }
          })
        }}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <label htmlFor="name">Nom:</label>
        <input type="text" name="name" />
        <label htmlFor="password">Mot de passe:</label>
        <input type="password" name="password" />
        <input type="submit" />
      </form>
    </div>
  )
}

export default Index
