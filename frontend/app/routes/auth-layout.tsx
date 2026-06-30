import { useAtomValue } from "jotai"
import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router"
import { userAtom } from "~/store/auth"

export default function AuthLayout() {
  const navigate = useNavigate()
  const user = useAtomValue(userAtom)

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true })
    }
  }, [navigate, user])

  return <Outlet />
}
