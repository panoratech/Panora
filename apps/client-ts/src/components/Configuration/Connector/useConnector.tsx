import { atom, useAtom } from "jotai"
import { providersArray } from "@panora/shared"


type Config = {
  selected: string
}

const configAtom = atom<Config>({
  selected: `crm-${providersArray("crm")[0].name}`,
})

export function useConnector() {
  return useAtom(configAtom)
}