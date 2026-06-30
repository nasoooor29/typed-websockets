import { useAtom } from "jotai"
import { useEffect } from "react"
import { Outlet } from "react-router"
import { toast } from "sonner"
import { useSocket, useSocketEvent } from "~/hooks"
import { userAtom } from "~/store/auth"

export default function AppLayout() {
  const socket = useSocket()
  const [user, setUser] = useAtom(userAtom)

  useSocketEvent("main.ErrorResponse", ({ message }) => toast.error(message))
  useSocketEvent("main.AuthSession", ({ user: authenticatedUser, token }) => {
    setUser({ ...authenticatedUser, token })
  })
  useSocketEvent("main.Me", ({ user: currentUser }) => {
    setUser((storedUser) =>
      currentUser && storedUser
        ? { ...currentUser, token: storedUser.token }
        : null
    )
  })
  useSocketEvent("main.LoggedOut", () => {
    setUser(null)
    toast.success("Logged out")
  })

  useEffect(() => {
    socket.emit("user.me", { token: user?.token ?? "" })
  }, [socket, user?.token])

  return <Outlet />
}
