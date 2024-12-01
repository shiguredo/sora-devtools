import type React from 'react'
import { Provider } from 'react-redux'
import DevTools from './DevTools.tsx'
import { store } from './app/store.ts'

const App = (): React.JSX.Element => {
  return (
    <Provider store={store}>
      <DevTools />
    </Provider>
  )
}

export default App
