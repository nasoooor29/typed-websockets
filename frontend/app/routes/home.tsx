import { useState } from "react"
import { Link, useOutletContext } from "react-router"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useSocket, useSocketEvent } from "~/hooks"
import type { AppOutletContext } from "./app-layout"

export default function Home() {
  const socket = useSocket()
  const { user } = useOutletContext<AppOutletContext>()
  const [message, setMessage] = useState("")
  const [pong, setPong] = useState("")

  useSocketEvent("main.Pong", ({ pong: response }) => {
    setPong(response)
    toast.success("Pong received")
  })

  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ping pong</CardTitle>
          <CardDescription>
            {user
              ? `Logged in as ${user.name}. Send a message over your websocket.`
              : "Log in or register to use the authenticated ping."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Say ping..."
              disabled={!user}
            />
          </div>
          {pong && (
            <p className="rounded-md bg-muted p-3 text-sm">
              Pong: <span className="font-medium">{pong}</span>
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-3">
          <Button
            className="w-full"
            disabled={!user}
            onClick={() => socket.emit("main.ping", { ping: message })}
          >
            Send ping
          </Button>
          {!user && (
            <div className="flex gap-4 text-sm">
              <Link
                className="font-medium text-primary hover:underline"
                to="/login"
              >
                Log in
              </Link>
              <Link
                className="font-medium text-primary hover:underline"
                to="/register"
              >
                Register
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </main>
  )
}
