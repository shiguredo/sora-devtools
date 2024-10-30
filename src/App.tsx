import { Provider } from 'react-redux'
import DevTools from './DevTools.tsx'
import { store } from './app/store.ts'

function App() {
  return (
    <Provider store={store}>
      <DevTools />
    </Provider>
  )
}

export default App
