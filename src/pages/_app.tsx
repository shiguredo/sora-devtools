import "bootstrap/dist/css/bootstrap.min.css";
import "./_app.css";

import { AppProps } from "next/app";
import { Provider } from "react-redux";

import store from "../store";

// eslint-disable-next-line
const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default MyApp;
