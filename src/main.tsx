import * as React from "react";
import * as ReactDOM from "react-dom";
import { Root } from "./components/root";
import { register } from "./service-worker/register";

export function main() {
  register();
  const element = document.querySelector("#root");
  ReactDOM.render(<Root />, element);
}
