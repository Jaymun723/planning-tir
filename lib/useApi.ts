import { useState, useEffect } from "react"
import { User } from "./userDb"
import Router from "next/router"

export const useApi = <T = any>(path: string, ops?: { redirectWhenFail?: string; options?: RequestInit }) => {
  const [res, setRes] = useState(undefined as undefined | T)
  const [refetchVal, setRefetchVal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const token = localStorage.getItem("token")
    const options: RequestInit = {
      ...ops?.options,
      headers: token
        ? {
            authorization: token,
            ...ops?.options?.headers,
          }
        : { ...ops?.options?.headers },
    }

    fetch(path, options).then((res) => {
      if (res.status === 200) {
        res.json().then((data) => {
          setLoading(false)
          setRes(data)
        })
      } else if (ops?.redirectWhenFail !== undefined) {
        Router.push(ops.redirectWhenFail)
      } else {
        res.json().then((data) => {
          setLoading(false)
          setRes(data)
        })
      }
    })
  }, [path, refetchVal])

  const refetch = () => setRefetchVal(!refetchVal)

  return [res, refetch, loading] as const
}
