import { createFileRoute } from "@tanstack/react-router";
import SignIn from "@/components/sign-in";

export const Route = createFileRoute("/auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignIn />;
}
