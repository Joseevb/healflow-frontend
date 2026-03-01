import { createFileRoute, redirect } from '@tanstack/react-router'
import { getServerSession } from '@/server/auth'
import SignIn from '@/components/sign-in'

export const Route = createFileRoute('/auth/')({
  beforeLoad: async () => {
    const session = await getServerSession()

    // Redirect authenticated users away from sign-in
    if (session?.user?.id) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <SignIn />
}
