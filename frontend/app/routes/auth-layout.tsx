import { useEffect } from "react"
import { Outlet, useNavigate, useOutletContext } from "react-router"
import type { AppOutletContext } from "./app-layout"

export default function AuthLayout() {
  const navigate = useNavigate()
  const { user } = useOutletContext<AppOutletContext>()

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true })
    }
  }, [navigate, user])

  return <Outlet />
}
