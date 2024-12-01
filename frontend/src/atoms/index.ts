import { atom, createStore } from 'jotai'

export * from '@/atoms/Auth'
export const appStore = createStore()
export const currentStoreAtom = atom(appStore)
