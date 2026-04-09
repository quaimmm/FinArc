'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()

  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const isSubpage = pathname !== '/'

  const navLinkClass = (href: string) =>
    `rounded-full px-4 py-2 text-sm transition ${
      pathname === href
        ? 'bg-white text-black'
        : 'text-zinc-300 hover:bg-white/10 hover:text-white'
    }`

  const injectedConnector = connectors.find(
    (connector) => connector.type === 'injected'
  )

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-2xl">
      <div className="flex w-full items-center gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          {isSubpage && (
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              ← Back
            </button>
          )}

          <Link href="/" className="flex items-center">
            <Image
              src="/logo-final.png"
              alt="FinArc logo"
              width={180}
              height={56}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <nav className="flex items-center gap-2">
            <Link href="/dashboard" className={navLinkClass('/dashboard')}>
              Dashboard
            </Link>

            <Link href="/create" className={navLinkClass('/create')}>
              Create Request
            </Link>

            <Link href="/docs" className={navLinkClass('/docs')}>
              Docs
            </Link>

            <a
              href="https://faucet.circle.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/20"
            >
              Arc Faucet
            </a>
          </nav>

          {!isConnected ? (
            <button
              type="button"
              onClick={() => {
                if (injectedConnector) connect({ connector: injectedConnector })
              }}
              disabled={!injectedConnector || isPending}
              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                {address ? shortenAddress(address) : 'Connected'}
              </div>

              <button
                type="button"
                onClick={() => disconnect()}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}