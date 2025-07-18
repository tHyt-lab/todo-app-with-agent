import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Provider } from "jotai";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getBasePath, handleGitHubPagesRedirect } from "./config/routing";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import "./locales";

// GitHub Pagesのリダイレクト処理を実行
handleGitHubPagesRedirect();

// Create a new router instance with base path support
const router = createRouter({
  routeTree,
  basepath: getBasePath(),
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
