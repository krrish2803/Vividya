import { motion } from 'framer-motion';

export function SkeletonBlock({ className = '', rounded = 'rounded-xl' }) {
  return (
    <div className={`animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 ${rounded} ${className}`}
      style={{ backgroundSize: '200% 100%' }} />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className="h-3" rounded="rounded-full"
          style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card p-5 rounded-2xl border border-white/10 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-10 h-10" rounded="rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-3 w-1/3" rounded="rounded-full" />
          <SkeletonBlock className="h-2 w-1/2" rounded="rounded-full" />
        </div>
      </div>
      <SkeletonBlock className="h-8 w-16" rounded="rounded-lg" />
      <SkeletonBlock className="h-2 w-full" rounded="rounded-full" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-96" rounded="rounded-lg" />
        <SkeletonBlock className="h-4 w-64" rounded="rounded-full" />
      </div>

      {/* Health score + mood skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl border border-white/10 p-6 flex flex-col items-center space-y-4">
          <SkeletonBlock className="h-4 w-32" rounded="rounded-full" />
          <SkeletonBlock className="w-[120px] h-[120px]" rounded="rounded-full" />
          <div className="flex gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="text-center space-y-1">
                <SkeletonBlock className="h-6 w-8 mx-auto" rounded="rounded" />
                <SkeletonBlock className="h-2 w-12 mx-auto" rounded="rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/10 p-6 space-y-4">
          <SkeletonBlock className="h-5 w-48" rounded="rounded-full" />
          <div className="flex gap-3">
            {[1,2,3,4,5].map(i => <SkeletonBlock key={i} className="w-12 h-12" rounded="rounded-xl" />)}
          </div>
          <SkeletonBlock className="h-10 w-full" rounded="rounded-xl" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>

      {/* Chart + radar + feed skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/10 p-5 space-y-3">
          <SkeletonBlock className="h-5 w-40" rounded="rounded-full" />
          <SkeletonBlock className="h-52 w-full" rounded="rounded-xl" />
        </div>
        <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-3">
          <SkeletonBlock className="h-5 w-32" rounded="rounded-full" />
          <SkeletonBlock className="h-48 w-full" rounded="rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="p-6 max-w-6xl mx-auto space-y-6">
      <SkeletonBlock className="h-8 w-64" rounded="rounded-lg" />
      <div className="flex gap-2">
        {[1,2,3].map(i => <SkeletonBlock key={i} className="h-10 w-28" rounded="rounded-lg" />)}
      </div>
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="glass-card rounded-2xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="w-10 h-10" rounded="rounded-xl" />
              <SkeletonBlock className="h-4 w-48" rounded="rounded-full" />
            </div>
            <SkeletonBlock className="h-3 w-full" rounded="rounded-full" />
            <SkeletonBlock className="h-3 w-3/4" rounded="rounded-full" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
