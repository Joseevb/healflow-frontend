import { createFileRoute } from "@tanstack/react-router";
import SignUp from "@/components/sign-up";

export const Route = createFileRoute("/auth/sign-up/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUp />;
}
