export interface User {
  name: string
  password: string
  isAdmin: boolean
}

interface Db {
  users: User[]
}

const db: Db = {
  users: [
    {
      name: "Jhon",
      password: "toto",
      isAdmin: false,
    },
    {
      name: "toto",
      password: "Jhon",
      isAdmin: true,
    },
  ],
}

export const loginUser = (userName: string, userPassword: string) => {
  return db.users.find((user) => user.name === userName && user.password === userPassword)
}

export const getUser = (name: string) => {
  return db.users.find((user) => user.name === name)
}
