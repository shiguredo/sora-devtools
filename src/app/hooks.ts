import { useSoraDevtoolsStore } from './store.ts'

export const useAppDispatch = () => useSoraDevtoolsStore.getState()
export const useAppSelector = <T>(selector: (state: import('./store.ts').RootState) => T) => useSoraDevtoolsStore(selector)