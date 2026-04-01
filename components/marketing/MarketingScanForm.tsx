'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export default function MarketingScanForm() {
  const [url, setUrl] = useState('')
  const router = useRouter()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!url.trim()) return

    let scanUrl = url.trim()
    if (!scanUrl.startsWith('http')) {
      scanUrl = `https://${scanUrl}`
    }

    router.push(`/auth/signup?url=${encodeURIComponent(scanUrl)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://yourcompany.com"
        className="w-full rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-white outline-none transition-all focus:border-[var(--zynthsecure-green)] sm:flex-1"
      />
      <button type="submit" className="btn-primary px-6 py-4 text-sm">
        Start Free Audit <ArrowRight size={16} className="inline-block" />
      </button>
    </form>
  )
}
