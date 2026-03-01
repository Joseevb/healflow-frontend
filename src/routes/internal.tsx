import { setAuthToken } from '@/lib/client-auth-config'
import { getJwtToken, getServerSession } from '@/server/auth'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/internal')({
  component: RouteComponent,
  beforeLoad: async () => {
    const [sessionData, jwtToken] = await Promise.all([
      getServerSession(),
      getJwtToken(),
    ])

    console.log(
      '[internal] Session check:',
      sessionData ? 'Session exists' : 'No session',
    )

    if (!sessionData?.session) {
      console.warn('[internal] No active session found, redirecting to auth')
      throw redirect({
        to: '/auth',
      })
    }

    if (sessionData.user.role !== 'specialist') {
      throw redirect({ to: '/unauthorized' })
    }

    if (jwtToken) {
      setAuthToken(jwtToken)
      console.log('[internal] JWT token set for API requests')
    } else {
      console.warn('[internal] No JWT token available')
    }

    return {
      hideHeader: true,
      user: sessionData.user,
    }
  },
})

function RouteComponent() {
  return <div>Hello "/internal"!</div>
}
