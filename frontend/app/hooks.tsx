import { createContext, useContext, useEffect, useMemo } from "react"
import { TypedSocket, type ClientEvents, type ServerEvents } from "./lib/ws"

const SocketContext = createContext<TypedSocket<
  ServerEvents,
  ClientEvents
> | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useMemo(() => {
    return new TypedSocket<ServerEvents, ClientEvents>("ws://localhost:8080/ws")
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
