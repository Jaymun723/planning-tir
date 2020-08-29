const db = {
  users: [
    {
      name: "Jhon",
      password: "toto",
    },
  ],
}

export const loginUser = (userName: string, userPassword: string) => {
  return db.users.find((user) => user.name === userName && user.password === userPassword)
}
