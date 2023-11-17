import 'bootstrap/dist/css/bootstrap.min.css'
import './_app.css'

import { AppProps } from 'next/app'
import { ReactElement } from 'react'
import { Provider } from 'react-redux'

import { store } from '@/app/store'

const MyApp = ({ Component, pageProps }: AppProps): ReactElement => {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
