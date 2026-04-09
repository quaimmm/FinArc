'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'requests', label: 'Requests' },
  { id: 'settlement', label: 'Settlement' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'why-finarc', label: 'Why FinArc' },
  { id: 'faq', label: 'FAQ' },
]

function Section({
  id,
  title,
  eyebrow,
  children,
}: {
  id: string
  title: string
  eyebrow?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-white/10 py-14 first:border-t-0 first:pt-0">
      {eyebrow ? (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-cyan-300/80">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mb-5 text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {title}
      </h2>
      <div className="space-y-5 text-[15px] leading-7 text-zinc-300 md:text-base">
        {children}
      </div>
    </section>
  )
}

function InfoCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm">
      <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
      <div className="text-sm leading-6 text-zinc-300">{children}</div>
    </div>
  )
}

function NavItem({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <a
      href={href}
      className={`block rounded-xl px-3 py-2 text-sm transition ${
        active
          ? 'bg-white text-black'
          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {label}
    </a>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview')

  const sectionIds = useMemo(() => sections.map((section) => section.id), [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id)
            }
          })
        },
        {
          rootMargin: '-30% 0px -55% 0px',
          threshold: 0.1,
        }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [sectionIds])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="mb-2 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-200">
                  Arc Testnet
                </div>
                <p className="text-sm leading-6 text-zinc-300">
                  FinArc documentation for request creation, wallet-based settlement,
                  and product architecture.
                </p>
              </div>

              <nav className="space-y-1">
                {sections.map((section) => (
                  <NavItem
                    key={section.id}
                    href={`#${section.id}`}
                    label={section.label}
                    active={activeSection === section.id}
                  />
                ))}
              </nav>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-7 shadow-2xl shadow-black/30 md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_top_left,rgba(255,255,255,0.07),transparent_28%)]" />
              <div className="relative">
                <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-zinc-300">
                  FinArc Docs
                </div>

                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  On-chain payment requests with a cleaner, simpler flow.
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
                  FinArc is a lightweight request layer built on Arc Testnet. It
                  helps users create structured payment requests, share them instantly,
                  and settle directly from wallets without adding unnecessary
                  complexity.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/create"
                    className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:opacity-90"
                  >
                    Create a request
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
                  >
                    Open dashboard
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <InfoCard title="Wallet-first">
                Users connect a browser wallet and interact directly with the app
                without creating traditional accounts.
              </InfoCard>
              <InfoCard title="Direct settlement">
                Payments move from payer to recipient on-chain. FinArc does not
                custody user funds.
              </InfoCard>
              <InfoCard title="Structured requests">
                Requests carry amount, recipient, and optional context in a cleaner,
                shareable format.
              </InfoCard>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <Section id="overview" title="Overview" eyebrow="Introduction">
                <p>
                  FinArc is designed to make payment intent clearer. Instead of
                  handling payment coordination through messages, screenshots, or
                  disconnected wallet transfers, FinArc introduces a simple request
                  object that can be created, shared, and settled on-chain.
                </p>
                <p>
                  The product is intentionally minimal. The goal is not to add layers
                  between users and payments, but to create a cleaner flow around
                  them. Wallet connection, request creation, and settlement all stay
                  straightforward.
                </p>
              </Section>

              <Section id="how-it-works" title="How it works" eyebrow="Flow">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard title="1. Connect wallet">
                    The user connects a supported browser wallet such as MetaMask or
                    Rabby through the FinArc interface.
                  </InfoCard>
                  <InfoCard title="2. Create request">
                    A request is created with an amount, recipient wallet, and an
                    optional note or reference.
                  </InfoCard>
                  <InfoCard title="3. Share request">
                    The request can be opened or shared through its own route or
                    request view.
                  </InfoCard>
                  <InfoCard title="4. Settle on-chain">
                    The payer confirms the transaction from their wallet, and the
                    request status updates once the transaction is confirmed.
                  </InfoCard>
                </div>
              </Section>

              <Section id="requests" title="Requests" eyebrow="Core object">
                <p>Each request is intended to be simple, structured, and readable.</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard title="Amount">
                    The requested payment value displayed to the payer in a clear,
                    standard format.
                  </InfoCard>
                  <InfoCard title="Recipient">
                    The destination wallet that will receive payment once the
                    transaction is executed.
                  </InfoCard>
                  <InfoCard title="Reference">
                    An optional note that adds context, such as purpose, invoice
                    label, or lightweight metadata.
                  </InfoCard>
                  <InfoCard title="Status">
                    Requests can remain open until successfully settled on-chain,
                    after which they can be displayed as completed.
                  </InfoCard>
                </div>

                <p>
                  This approach gives both sides a cleaner transaction context and
                  reduces ambiguity compared with ad hoc transfers.
                </p>
              </Section>

              <Section id="settlement" title="Settlement" eyebrow="Payments">
                <p>
                  FinArc does not hold funds, pool balances, or act as an
                  intermediary. Settlement happens directly from the payer’s wallet
                  to the intended recipient through the connected network.
                </p>
                <p>
                  This keeps the product model simple and improves transparency.
                  Users retain control of transaction approval at the wallet level,
                  and payment confirmation can be traced on-chain.
                </p>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm leading-6 text-emerald-100">
                  FinArc is non-custodial by design. Users approve transactions from
                  their own wallets, and the application does not take possession of
                  funds.
                </div>
              </Section>

              <Section id="architecture" title="Architecture" eyebrow="System design">
                <p>
                  FinArc is intentionally lightweight. The stack is selected to keep
                  the product fast to iterate on while remaining credible as an
                  on-chain application.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard title="Frontend">
                    Next.js powers the application interface, routing, and page-level
                    structure.
                  </InfoCard>
                  <InfoCard title="Wallet layer">
                    Wagmi manages wallet connection state and interaction with injected
                    browser wallets.
                  </InfoCard>
                  <InfoCard title="Chain">
                    Arc Testnet is used for request settlement and transaction flow
                    during the current phase.
                  </InfoCard>
                  <InfoCard title="Data layer">
                    Supabase can support request persistence, history, and product
                    state outside wallet interactions.
                  </InfoCard>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/40 p-5 md:p-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                      <p className="text-sm font-medium text-white">User</p>
                      <p className="mt-1 text-xs text-zinc-400">Wallet-connected session</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                      <p className="text-sm font-medium text-white">Next.js App</p>
                      <p className="mt-1 text-xs text-zinc-400">UI, pages, request flow</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                      <p className="text-sm font-medium text-white">Wagmi</p>
                      <p className="mt-1 text-xs text-zinc-400">Wallet connection state</p>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                      <p className="text-sm font-medium text-white">Arc Testnet</p>
                      <p className="mt-1 text-xs text-cyan-100/80">Settlement network</p>
                    </div>
                  </div>
                </div>
              </Section>

              <Section id="why-finarc" title="Why FinArc" eyebrow="Principles">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard title="Cleaner intent">
                    Payment requests make the purpose and destination of a transfer
                    explicit before settlement.
                  </InfoCard>
                  <InfoCard title="Less friction">
                    Users interact through wallets they already use instead of
                    creating extra accounts or workflows.
                  </InfoCard>
                  <InfoCard title="Transparent state">
                    Request status can move from open to completed with clear,
                    verifiable settlement logic.
                  </InfoCard>
                  <InfoCard title="Composable foundation">
                    The request layer can evolve into richer invoice, payroll,
                    merchant, or protocol-native payment flows.
                  </InfoCard>
                </div>
              </Section>

              <Section id="faq" title="FAQ" eyebrow="Questions">
                <div className="grid gap-4">
                  <InfoCard title="Do I need a wallet to use FinArc?">
                    Yes. FinArc currently relies on browser wallets such as MetaMask
                    or Rabby for connection and transaction approval.
                  </InfoCard>

                  <InfoCard title="Is FinArc live on mainnet?">
                    Not at the moment. The current setup is on Arc Testnet.
                  </InfoCard>

                  <InfoCard title="Does FinArc hold user funds?">
                    No. FinArc is non-custodial. Funds move directly from the payer’s
                    wallet to the recipient.
                  </InfoCard>

                  <InfoCard title="What happens if a transaction fails?">
                    The request remains open until a successful payment is confirmed.
                  </InfoCard>
                </div>
              </Section>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 md:p-8">
                <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
                      Next step
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      Start creating and testing request flows.
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                      FinArc is designed to stay simple at the surface while giving
                      you a strong base for more advanced payment workflows.
                    </p>
                  </div>

                  <Link
                    href="/create"
                    className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
                  >
                    Create request
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}