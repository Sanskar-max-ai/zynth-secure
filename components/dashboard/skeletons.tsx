import React from 'react'

export function Shimmer({ className }: { className?: string }) {
  return <div className={`shimmer rounded-lg bg-white/5 ${className}`} />
}

export function StatsSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-6 flex items-center justify-between">
          <div className="space-y-3">
            <Shimmer className="w-24 h-3" />
            <Shimmer className="w-16 h-8" />
          </div>
          <Shimmer className="w-12 h-12 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function ScanFeedSkeleton() {
  return (
    <div className="space-y-4">
      <Shimmer className="w-32 h-6 mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
               <Shimmer className="w-10 h-10 rounded-full" />
               <div className="space-y-2">
                 <Shimmer className="w-32 h-4" />
                 <Shimmer className="w-48 h-3" />
               </div>
             </div>
             <Shimmer className="w-20 h-8" />
           </div>
           <div className="flex gap-2">
             <Shimmer className="w-16 h-5" />
             <Shimmer className="w-20 h-5" />
             <Shimmer className="w-14 h-5" />
           </div>
        </div>
      ))}
    </div>
  )
}

export function AIPrioritySkeleton() {
  return (
    <div className="space-y-4">
      <Shimmer className="w-40 h-6" />
      <div className="card p-6 space-y-4">
        <Shimmer className="w-full h-4" />
        <Shimmer className="w-full h-4" />
        <Shimmer className="w-3/4 h-4" />
        <Shimmer className="w-24 h-4 mt-6" />
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="flex justify-between">
          <Shimmer className="w-1/4 h-4" />
          <Shimmer className="w-1/6 h-4" />
          <Shimmer className="w-1/6 h-4" />
          <Shimmer className="w-1/6 h-4" />
          <Shimmer className="w-1/12 h-4 text-right" />
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 flex justify-between items-center bg-white/[0.01]">
            <Shimmer className="w-1/4 h-5" />
            <Shimmer className="w-1/6 h-4" />
            <Shimmer className="w-1/6 h-5" />
            <Shimmer className="w-1/6 h-6 rounded" />
            <Shimmer className="w-1/12 h-4 text-right" />
          </div>
        ))}
      </div>
    </div>
  )
}
