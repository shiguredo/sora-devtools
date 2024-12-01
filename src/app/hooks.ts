import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { AnyAction } from 'redux'
import type { ThunkDispatch } from 'redux-thunk'

import type { AppDispatch, RootState } from './store.ts'

export const useAppDispatch = (): ThunkDispatch<RootState, undefined, AnyAction> =>
  useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
