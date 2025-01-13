import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/games/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
        <Link to="/scenes" className="[&.active]:font-bold">
          Scenes
        </Link>
      </div>
      <hr />
    </div>
  );
}
