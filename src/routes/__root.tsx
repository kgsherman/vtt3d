import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import HiddenMenu from "../components/scene/hidden-menu";

export const Route = createRootRoute({
  component: () => (
    <>

      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
