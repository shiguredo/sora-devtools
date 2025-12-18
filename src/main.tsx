import { render } from "preact";
import "./App.css";
import App from "./App.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

render(<App />, rootElement);
