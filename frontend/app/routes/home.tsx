import { useState } from "react"
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

export default function Home() {
  const s = useSocket()
  const [inp, setInp] = useState("")
  const [frm, setFrm] = useState({
    username: "",
    password: "",
  })
  const [user, setUser] = useState("")

  useSocketEvent("main.Pong", (p) => {
    console.debug("[home] pong", p)
    toast.success(`Pong received: ${p.pong}`)
  })

  useSocketEvent("main.ErrorResponse", (p) => {
    console.error("[home] server error", p)
    toast.error(p.message)
  })

  useSocketEvent("main.User", (p) => {
    toast.success(`User: ${p.name}`)
  })

  return (
    <div className="min-h-svh bg-muted/30 p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Typed Sock Control Panel</CardTitle>
            <CardDescription>
              Test the websocket flow from one place. Each action is split into
              its own card so the page is easier to scan and extend.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <div className="rounded-xl bg-background/70 p-4">
              Create a user with a username and password.
            </div>
            <div className="rounded-xl bg-background/70 p-4">
              Look up an existing user by name.
            </div>
            <div className="rounded-xl bg-background/70 p-4">
              Send a ping payload and watch for the pong toast response.
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Register User</CardTitle>
              <CardDescription>
                Create a new user through the websocket API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username..."
                  value={frm.username}
                  onChange={(e) => setFrm({ ...frm, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="Enter your password..."
                  type="password"
                  value={frm.password}
                  onChange={(e) => setFrm({ ...frm, password: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  s.emit("user.create", {
                    name: frm.username,
                    password: frm.password,
                  })
                }}
              >
                Register
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Find User</CardTitle>
              <CardDescription>
                Request a user record by username.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="lookup-user">Username</Label>
              <Input
                id="lookup-user"
                placeholder="Enter a username..."
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  s.emit("user.get", { name: user })
                }}
              >
                Get user
              </Button>
            </CardFooter>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ping Playground</CardTitle>
              <CardDescription>
                Send a quick test message to confirm the socket round trip is
                working.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="ping-message">Message</Label>
                <Input
                  id="ping-message"
                  placeholder="Enter a message..."
                  value={inp}
                  onChange={(e) => setInp(e.target.value)}
                />
              </div>
              <Button
                type="button"
                className="w-full md:w-auto"
                onClick={() => {
                  console.debug("[home] ping click")
                  s.emit("main.ping", { ping: inp })
                }}
              >
                Send ping
              </Button>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Welcome to
              <span className="ml-1 font-medium text-foreground">
                Typed Sock
              </span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
