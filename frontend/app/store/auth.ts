import { atomWithStorage } from "jotai/utils"

export type StoredUser = {
  id: number
  name: string
  token: string
}

export const userAtom = atomWithStorage<StoredUser | null>(
  "typed-sock.session",
  null,
  undefined,
  { getOnInit: true }
)
