import { createContext, useContext, useEffect, useMemo } from "react"
import {
  TypedSocket,
  clientEventSchemas,
  serverEventSchemas,
  type ServerEvents,
} from "./lib/ws"

const SocketContext = createContext<TypedSocket<
  typeof serverEventSchemas,
  typeof clientEventSchemas
> | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useMemo(() => {
    return new TypedSocket(
      "ws://localhost:8080/ws",
      serverEventSchemas,
      clientEventSchemas
    )
  }, [])

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

export function useSocket() {
  const socket = useContext(SocketContext)

  if (!socket) {
    throw new Error("useSocket must be used inside SocketProvider")
  }

  return socket
}

export function useSocketEvent<K extends keyof ServerEvents & string>(
  event: K,
  handler: (payload: ServerEvents[K]) => void
) {
  const socket = useSocket()

  useEffect(() => {
    const unsubscribe = socket.on(event, handler)
    return () => {
      unsubscribe()
    }
  }, [socket, event, handler])
}
