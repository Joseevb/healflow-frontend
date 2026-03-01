import { Image } from '@unpic/react'
import { toast } from 'sonner'
import type { Dispatch, SetStateAction } from 'react'
import type { IsLoading, SocialSignOnProvider } from '../types/auth'
import { Button } from '@/components/ui/button'
import { signIn } from '@/lib/auth-client'
import type { RoutePath } from '@/types/routes'

export const socialSignOnProviders: Array<SocialSignOnProvider> = [
  {
    name: 'google',
    imageUrl: '/google.svg',
  },
  {
    name: 'apple',
    imageUrl: '/apple.svg',
    onClick: () => toast.error('Apple sign in is not implemented yet'),
  },
]

interface SocialSignOnProps {
  isLoading: IsLoading
  setIsLoading: Dispatch<SetStateAction<IsLoading>>
}

export default function SocialSignOn({
  isLoading,
  setIsLoading,
}: SocialSignOnProps) {
  return (
    <div className="space-y-2">
      {socialSignOnProviders.map((provider) => (
        <Button
          key={provider.name}
          variant="outline"
          className="w-full gap-2"
          disabled={isLoading.type === provider.name && isLoading.loading}
          onClick={async () => {
            console.log('Button clicked')
            setIsLoading({ loading: true, type: provider.name })

            try {
              console.log('Calling signIn.social...')
              const result = await signIn.social({
                provider: provider.name,
                callbackURL: '/auth/social-callback' as RoutePath,
              })
              console.log('Result:', result) // This may never log if redirect happens
            } catch (err) {
              console.error('Sign in error:', err)
              setIsLoading({ loading: false, type: provider.name })
              toast.error((err as Error).message || 'Failed to sign in')
            }
          }}
        >
          <Image
            src={provider.imageUrl}
            alt={`${provider.name} logo`}
            width={16}
            height={16}
          />
          <div>
            <span>Continue with </span>
            <span className="capitalize">{provider.name}</span>
          </div>
        </Button>
      ))}
    </div>
  )
}
