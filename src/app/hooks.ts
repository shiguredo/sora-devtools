import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { Action } from 'redux'
import type { ThunkDispatch } from 'redux-thunk'

import type { AppDispatch, RootState } from './store.ts'

export const useAppDispatch = (): ThunkDispatch<RootState, undefined, Action> =>
  useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
