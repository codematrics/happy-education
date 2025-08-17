# Build Performance Optimization TODO

## Phase 1: Immediate Fixes

- [ ] Add timeout handling to API calls
- [ ] Reduce prefetch payload sizes
- [ ] Add maxDuration to problematic pages
- [ ] Implement error boundaries

## Phase 2: Data Fetching Optimization

- [ ] Optimize useCourses and useMyCourses hooks
- [ ] Implement selective prefetching
- [ ] Add caching strategies

## Phase 3: Component Optimization

- [ ] Split heavy components
- [ ] Add pagination controls
- [ ] Implement memoization

## Phase 4: Build Configuration

- [ ] Configure ISR for non-critical data
- [ ] Add build-time logging
- [ ] Test performance improvements

## Files to Modify

1. src/lib/fetch.ts - Add timeout handling
2. src/app/(user)/my-courses/page.tsx - Optimize prefetching
3. src/app/(user)/page.tsx - Reduce data fetching
4. src/hooks/useCourses.ts - Add optimization
5. src/hooks/useMyCourses.ts - Add timeout and error handling
6. src/components/my-course/MyCourse.tsx - Implement pagination
