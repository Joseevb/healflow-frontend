import { Link, useNavigate } from '@tanstack/react-router'
import { useTheme } from '@/components/providers/theme-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'
import { LogOut, Moon, Settings, Sun, UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@/types/auth'
import { signOut } from '@/lib/auth-client'

export function UserMenu({ user }: { user: User }) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-6 hover:bg-sidebar-accent"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-sm font-medium">
            {getInitials(user.name)}
          </div>
          <div className="flex flex-col items-start text-sm">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings">
            <UserIcon className="size-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings">
            <Settings className="size-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => setTheme(theme === 'light' ? 'dark' : 'light', e)}
        >
          {theme === 'light' ? (
            <Moon className="size-4 mr-2" />
          ) : (
            <Sun className="size-4 mr-2" />
          )}
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await signOut()
            await navigate({ to: '/' })
          }}
        >
          <LogOut className="size-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
