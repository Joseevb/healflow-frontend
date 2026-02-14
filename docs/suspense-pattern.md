# Suspense Pattern for Data-Dependent Forms

## Overview

This document explains the modern Suspense-based pattern implemented for forms that depend on asynchronously loaded data, specifically for the user signup form with specialist selection.

## Problem

The original implementation had issues with dynamic form updates:

- Form components wouldn't re-render when data loaded
- Select dropdown remained empty despite data being fetched
- Complex memoization and key prop workarounds didn't solve the issue

## Solution: Suspense + useSuspenseQuery

### Key Components

1. **Loader-level prefetching** (`src/routes/auth/sign-up.user-data.tsx:41-46`)

   ```typescript
   await context.queryClient.ensureQueryData(
     getAvailableSpecialistsOptions({
       query: { type: "GENERAL_PRACTICE" },
     }),
   );
   ```

   - Prefetches data on the server/loader level
   - Ensures data is available before component renders
   - Improves perceived performance

2. **Suspense boundary** (line 117-126)

   ```typescript
   <Suspense
     fallback={
       <div className="flex gap-3 items-center justify-center">
         <Spinner />
         <span>Loading specialists...</span>
       </div>
     }
   >
     <UserDataForm />
   </Suspense>
   ```

   - Shows loading UI while data fetches
   - Cleanly separates loading state from component logic

3. **useSuspenseQuery** (line 138-144)

   ```typescript
   const { data: specialistsResponse } = useSuspenseQuery(
     getAvailableSpecialistsOptions({
       query: { type: "GENERAL_PRACTICE" },
     }),
   );
   ```

   - Suspends component rendering until data is ready
   - No need for manual loading/error states
   - Data is guaranteed to be available after hook returns

4. **Conditional rendering** (line 172-181)

   ```typescript
   if (!specialistsResponse || specialistsResponse.length === 0) {
     return <Alert variant="destructive">...</Alert>
   }
   ```

   - Handles edge case of empty data
   - Provides user feedback for no specialists

## Benefits

### Performance

- **Server-side prefetching**: Data loads in parallel with route transition
- **No waterfalls**: Specialists data fetches immediately, not after component mount
- **Cached data**: React Query caches results across navigation

### Developer Experience

- **No manual loading states**: Suspense handles it automatically
- **Type safety**: useSuspenseQuery guarantees data is non-null
- **Simpler code**: No complex memoization or effect dependencies

### User Experience

- **Consistent loading UI**: Suspense fallback shows clear loading state
- **No flash of empty forms**: Form only renders when data is ready
- **Better perceived performance**: Prefetching makes navigation feel instant

## Pattern Summary

```typescript
// 1. Prefetch in loader
loader: async ({ context }) => {
  await context.queryClient.ensureQueryData(queryOptions)
  return { data }
}

// 2. Wrap component in Suspense
<Suspense fallback={<LoadingUI />}>
  <DataDependentComponent />
</Suspense>

// 3. Use useSuspenseQuery in component
function DataDependentComponent() {
  const { data } = useSuspenseQuery(queryOptions)
  // data is guaranteed to be available here
  return <Form data={data} />
}
```

## When to Use This Pattern

✅ **Use when:**

- Component requires data before it can render
- Data is fetched via React Query
- You want optimal loading UX
- You're using TanStack Router with loaders

❌ **Don't use when:**

- Data is optional (use `useQuery` instead)
- You need partial rendering before data loads
- Working with legacy code without Suspense support

## Related Files

- `src/routes/auth/sign-up.user-data.tsx` - Implementation example
- `src/components/dynamic-form.tsx` - Dynamic form factory
- `src/components/form-fields.tsx` - Form field components
- `src/lib/api-client.ts` - API key interceptor configuration

## Migration Notes

If migrating from `useQuery` to `useSuspenseQuery`:

1. Add `useSuspenseQuery` import
2. Wrap component in `<Suspense>` boundary
3. Replace `useQuery` with `useSuspenseQuery`
4. Remove manual `isLoading` and `error` handling
5. Remove `key` props used to force re-renders
6. Remove complex `useMemo` dependencies
7. Add loader-level prefetching for optimal performance

## References

- [TanStack Query Suspense](https://tanstack.com/query/latest/docs/react/guides/suspense)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [TanStack Router Loaders](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)
