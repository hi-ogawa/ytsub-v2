import * as React from "react";
import * as ReactDOM from "react-dom";
import { Root } from "./components/root";

export function main() {
  const element = document.querySelector("#root");
  ReactDOM.render(<Root />, element);
}
