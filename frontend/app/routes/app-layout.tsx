import { useEffect, useState } from "react"
import { Outlet } from "react-router"
import { toast } from "sonner"
import { useSocket, useSocketEvent } from "~/hooks"

export type SessionUser = {
  id: number
  name: string
}

export type AppOutletContext = {
  user: SessionUser | null
}

export default function AppLayout() {
  const socket = useSocket()
  const [user, setUser] = useState<SessionUser | null>(null)

  useSocketEvent("main.ErrorResponse", ({ message }) => toast.error(message))
  useSocketEvent("main.User", setUser)
  useSocketEvent("main.Me", ({ user: currentUser }) => setUser(currentUser))

  useEffect(() => {
    socket.emit("user.me", {})
  }, [socket])

  return <Outlet context={{ user } satisfies AppOutletContext} />
}
