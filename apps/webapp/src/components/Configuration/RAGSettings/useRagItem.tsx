import { atom, useAtom } from "jotai"
import { vectorDatabases, embeddingModels } from "./utils"

type ItemType = "vectorDatabase" | "embeddingModel"

type Config = {
  selected: string
  type: string
}

const configAtom = atom<Config>({
  selected: vectorDatabases[0].name,
  type: "vectorDatabase"
})

export function useRagItem() {
  return useAtom(configAtom)
}