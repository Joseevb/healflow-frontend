import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/internal/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/internal/"!</div>
}
