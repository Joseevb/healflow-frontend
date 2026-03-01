import type { AdminUserProfile } from '@/client'
import { getAllUsersOptions } from '@/client/@tanstack/react-query.gen'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/animate-ui/components/radix/sidebar'
import type { SidebarItems } from '@/components/app-sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DataTable } from '@/components/data-table'
import { Spinner } from '@/components/ui/spinner'
import { UserMenu } from '@/components/user-menu'
import { authClient } from '@/lib/auth-client'
import { getJwt, getSession } from '@/lib/auth-session'
import { setAuthToken } from '@/lib/client-auth-config'
import type { User } from '@/types/auth'
import type { RoutePath } from '@/types/routes'
import type { EnsureQueryDataOptions } from '@tanstack/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Home } from 'lucide-react'
import { useMemo } from 'react'

const getAllAuthUsersOptions = {
  queryKey: ['admin', 'auth-users'],
  queryFn: async () => {
    const { data } = await authClient.admin.listUsers({
      query: {},
    })

    return data?.users || []
  },
} satisfies EnsureQueryDataOptions

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = await getSession()

    if (!session) {
      throw redirect({ to: '/auth' })
    }

    if (session.user.role !== 'admin') {
      throw redirect({ to: '/unauthorized' })
    }

    const jwt = await getJwt()

    if (jwt) {
      setAuthToken(jwt)
    }

    await Promise.allSettled([
      context.queryClient.ensureQueryData(getAllUsersOptions()),
      context.queryClient.ensureQueryData(getAllAuthUsersOptions),
    ])

    console.log({ session })

    return {
      hideHeader: true,
      user: session.user,
    }
  },
  pendingComponent: LoaderComponent,
})

function LoaderComponent() {
  return (
    <SideBar>
      <Spinner />
    </SideBar>
  )
}

function SideBar({ children }: { children: React.ReactNode }) {
  const { user } = Route.useRouteContext() satisfies { user: User }

  const sidebarItems = (_baseUrl: RoutePath): SidebarItems => [
    {
      title: 'Dashboard',
      icon: Home,
      url: '/admin/dashboard',
    },
  ]

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          renderTrigger={true}
          baseUrl="/dashboard"
          items={sidebarItems}
          footer={<UserMenu user={user} />}
        />
        <SidebarInset className="bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

type UserTableRow = Pick<
  AdminUserProfile,
  | 'id'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone'
  | 'auth_id'
  | 'is_subscribed'
  | 'is_active'
  | 'created_at'
  | 'updated_at'
> &
  Pick<User, 'role' | 'stripeCustomerId'>

const columns: Array<ColumnDef<UserTableRow>> = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'first_name',
    header: 'First Name',
  },
  {
    accessorKey: 'last_name',
    header: 'Last Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'auth_id',
    header: 'Auth ID',
  },
  {
    accessorKey: 'is_subscribed',
    header: 'Is Subscribed',
  },
  {
    accessorKey: 'is_active',
    header: 'Is Active',
  },
  {
    accessorKey: 'stripeCustomerId',
    header: 'Stripe Customer ID',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated At',
  },
  {
    accessorFn: (_row) => {
      console.debug({ _row })
    },
    header: 'Actions',
  },
]

function Dashboard() {
  const { data: users } = useSuspenseQuery(getAllUsersOptions())
  const { data: authUsers } = useSuspenseQuery(getAllAuthUsersOptions)

  const tableData = useMemo(() => {
    return (users?.users || []).map((user) => {
      const authUser = authUsers?.find((u) => u.id === user.auth_id)
      return { ...user, ...authUser } as UserTableRow
    })
  }, [users, authUsers])

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={tableData} />
    </div>
  )
}

function RouteComponent() {
  return (
    <SideBar>
      <Dashboard />
    </SideBar>
  )
}
