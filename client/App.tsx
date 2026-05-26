import "@kpmg-us/ad-design-lib/dist/ad-design-lib.css";
import "./global.css";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { AppRoot } from "./AppRoot";

// Entry point — no JSX so vite-plugin-react skips Fast Refresh on this file.
// createRoot is therefore never called twice during HMR cycles.
createRoot(document.getElementById("root")!).render(createElement(AppRoot));
