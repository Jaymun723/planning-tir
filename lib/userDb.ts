export interface User {
  name: string
  password: string
}

interface Db {
  users: User[]
}

const db: Db = {
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

export const getUser = (name: string) => {
  return db.users.find((user) => user.name === name)
}
