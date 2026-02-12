import { createFileRoute, redirect } from '@tanstack/react-router'
import { checkIsNewUser } from '@/server/auth'

export const Route = createFileRoute('/auth/social-callback')({
  beforeLoad: async () => {
    const { isNewUser } = await checkIsNewUser()

    console.log('[social-callback] isNewUser:', isNewUser)

    if (isNewUser) {
      console.log('[social-callback] Redirecting to sign-up forms')
      throw redirect({ to: '/auth/sign-up/user-data' })
    } else {
      console.log('[social-callback] Redirecting to dashboard')
      throw redirect({ to: '/dashboard' })
    }
  },
})
