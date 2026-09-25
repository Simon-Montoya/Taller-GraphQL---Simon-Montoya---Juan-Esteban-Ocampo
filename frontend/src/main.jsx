import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";

import App from "./App.jsx";
import "./index.css";

import { apolloClient } from "./lib/apolloClient.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </StrictMode>
);
