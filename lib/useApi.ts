import { useState, useEffect } from "react"
import { User } from "./userDb"
import Router from "next/router"

export const useApi = <T = any>(path: string, ops?: { redirectWhenFail?: string }) => {
  const [res, setRes] = useState(undefined as undefined | T)
  const [refetchVal, setRefetchVal] = useState(false)

  useEffect(() => {
    fetch(path).then((res) => {
      if (res.status === 200) {
        res.json().then((data) => setRes(data))
      } else if (ops?.redirectWhenFail !== undefined) {
        Router.push(ops.redirectWhenFail)
      } else {
        res.json().then((data) => setRes(data))
      }
    })
  }, [path, refetchVal])

  const refetch = () => setRefetchVal(!refetchVal)

  return [res, refetch] as const
}
