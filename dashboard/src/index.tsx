import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import { Provider } from "react-redux";
import store from "./store";
import { Toaster } from "react-hot-toast";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback="loading...">
        <App />
        <Toaster
          toastOptions={{
            position: "top-right",
            style: {
              background: "#283046",
              color: "white",
            },
          }}
        />
      </Suspense>
    </Provider>
  </React.StrictMode>
);
