import { render } from "preact";
import { LocationProvider } from "preact-iso";
import "./App.css";
import App from "./App.tsx";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Root element not found");
}

render(
  <LocationProvider>
    <App />
  </LocationProvider>,
  rootElement,
);
