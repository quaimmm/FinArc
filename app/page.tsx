'use client'

import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { MouseEvent } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

function FloatingOrb({
  className,
  delay = 0,
}: {
  className: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: [0.18, 0.4, 0.18],
        y: [0, -18, 0],
        x: [0, 16, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={className}
    />
  )
}

function FeatureCard({
  eyebrow,
  title,
  description,
  delay = 0,
}: {
  eyebrow: string
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="finarc-card p-6"
    >
      <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-[family:var(--font-cormorant)] text-3xl font-semibold leading-none text-white">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-zinc-400">{description}</p>
    </motion.div>
  )
}

function MiniRequestCard({
  title,
  amount,
  meta,
  status,
  accent,
  delay = 0,
}: {
  title: string
  amount: string
  meta: string
  status: string
  accent: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="finarc-card p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {amount}
          </p>
          <p className="mt-2 text-sm text-zinc-500">{meta}</p>
        </div>

        <span className={`rounded-full border px-3 py-1 text-xs ${accent}`}>
          {status}
        </span>
      </div>
    </motion.div>
  )
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 24 })
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 24 })

  const glowX = useTransform(smoothX, (v) => v - 180)
  const glowY = useTransform(smoothY, (v) => v - 180)

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <main
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden text-white"
    >
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb
          delay={0}
          className="absolute left-[7%] top-[7%] h-72 w-72 rounded-full bg-white/8 blur-3xl"
        />
        <FloatingOrb
          delay={1}
          className="absolute right-[8%] top-[16%] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl"
        />
        <FloatingOrb
          delay={2}
          className="absolute bottom-[10%] left-[14%] h-96 w-96 rounded-full bg-violet-500/10 blur-3xl"
        />
        <FloatingOrb
          delay={1.6}
          className="absolute bottom-[8%] right-[14%] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl"
        />

        <motion.div
          style={{ x: glowX, y: glowY }}
          className="pointer-events-none absolute h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_24%,transparent_76%,rgba(255,255,255,0.04))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.08]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-14 pt-8">
        <section className="grid gap-8 xl:grid-cols-[1.06fr_0.94fr]">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="finarc-panel relative overflow-hidden p-7 sm:p-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_28%)]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(8,18,38,0.36)] px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Premium crypto payments
              </div>

              {isConnected && address && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300">
                  Connected wallet: {shortenAddress(address)}
                </div>
              )}

              <h1 className="mt-6 max-w-4xl font-[family:var(--font-cormorant)] text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl xl:text-7xl">
                Turn a wallet transfer
                <span className="block bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                  into a premium payment experience
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                FinArc lets you create structured USDC payment links on Arc,
                share them instantly, and track status cleanly. It is built for
                freelancers, builders, and teams who want crypto payments to
                feel more intentional and polished.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {!isConnected ? (
                  <>
                    <button
                      type="button"
                      onClick={() => connect({ connector: injected() })}
                      className="finarc-button-primary text-center"
                    >
                      Connect Wallet
                    </button>

                    <Link
                      href="/dashboard"
                      className="finarc-button-secondary text-center"
                    >
                      Open dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/create"
                      className="finarc-button-primary text-center"
                    >
                      Create payment request
                    </Link>
                    <Link
                      href="/dashboard"
                      className="finarc-button-secondary text-center"
                    >
                      Open dashboard
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="finarc-card p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    Requests
                  </p>
                  <p className="mt-3 text-2xl font-semibold">Instant</p>
                </div>
                <div className="finarc-card p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    Payment state
                  </p>
                  <p className="mt-3 text-2xl font-semibold">Shared</p>
                </div>
                <div className="finarc-card p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    Experience
                  </p>
                  <p className="mt-3 text-2xl font-semibold">Premium</p>
                </div>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                <div className="finarc-card p-5">
                  <p className="text-sm font-medium text-white">
                    1. Connect your wallet
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Start with your wallet identity so your requests and dashboard stay personal.
                  </p>
                </div>
                <div className="finarc-card p-5">
                  <p className="text-sm font-medium text-white">
                    2. Create a request
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Add amount, client, notes, expiry, and structured context.
                  </p>
                </div>
                <div className="finarc-card p-5">
                  <p className="text-sm font-medium text-white">
                    3. Track live status
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    See pending and paid states reflect cleanly across sessions.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="relative"
          >
            <div className="finarc-panel p-5 sm:p-6">
              <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-[rgba(8,18,38,0.42)] px-5 py-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    Product snapshot
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    FinArc request layer
                  </p>
                </div>

                <div className="rounded-full border border-emerald-700/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  Arc / native USDC
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <MiniRequestCard
                  title="Logo Design Sprint"
                  amount="150 USDC"
                  meta="Expires in 7 days"
                  status="Pending"
                  accent="border-amber-700/40 bg-amber-500/10 text-amber-300"
                  delay={0.18}
                />
                <MiniRequestCard
                  title="Landing Page Build"
                  amount="300 USDC"
                  meta="Partially settled"
                  status="Partial"
                  accent="border-blue-700/40 bg-blue-500/10 text-blue-300"
                  delay={0.25}
                />
                <MiniRequestCard
                  title="Consulting Session"
                  amount="80 USDC"
                  meta="Settled successfully"
                  status="Paid"
                  accent="border-emerald-700/40 bg-emerald-500/10 text-emerald-300"
                  delay={0.32}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.36 }}
                whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
                className="mt-5 rounded-[28px] border border-white/10 bg-[rgba(8,18,38,0.58)] p-6"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                      Client-facing payment page
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-tight">
                      150.00 USDC
                    </p>
                    <p className="mt-3 text-zinc-400">
                      Logo design for a brand refresh sprint
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                      Status
                    </p>
                    <p className="mt-1 text-sm text-amber-300">
                      Awaiting payment
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                      Client
                    </p>
                    <p className="mt-2 text-sm text-zinc-200">Acme Studio</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                      Reference
                    </p>
                    <p className="mt-2 text-sm text-zinc-200">FIN-2026-482731</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                      Expiry
                    </p>
                    <p className="mt-2 text-sm text-zinc-200">7 days</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                      Settlement
                    </p>
                    <p className="mt-2 text-sm text-zinc-200">
                      Arc native USDC
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button className="finarc-button-primary">Pay now</button>
                  <button className="finarc-button-secondary">
                    Copy link
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <FeatureCard
            eyebrow="Why FinArc"
            title="More elegant than sending a wallet address"
            description="FinArc adds structure, clarity, and premium presentation to crypto payment requests without making the flow feel heavy."
            delay={0.12}
          />
          <FeatureCard
            eyebrow="Built for"
            title="Freelancers, builders, and crypto-native teams"
            description="Useful when you want clients or collaborators to understand exactly what they are paying for and what the payment status is."
            delay={0.18}
          />
          <FeatureCard
            eyebrow="Current stage"
            title="MVP with real shared payment state"
            description="Payment actions and synced status already work. The current focus is turning the experience into a truly premium product."
            delay={0.24}
          />
        </section>

        <motion.section
          id="faucet"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28 }}
          className="finarc-panel mt-8 p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                Arc testnet
              </p>
              <h2 className="mt-3 font-[family:var(--font-cormorant)] text-4xl font-semibold leading-none text-white sm:text-5xl">
                Need test funds before you build?
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
                Use the Arc testnet faucet to get funds for creating, sending,
                and testing payment requests inside FinArc without friction.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="https://docs.arc.network"
                target="_blank"
                rel="noreferrer"
                className="finarc-button-secondary text-center"
              >
                Arc docs
              </a>
              <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noreferrer"
                className="finarc-button-primary text-center"
              >
                Open faucet
              </a>
            </div>
            



            <div className="fixed bottom-6 right-6 z-50">
              <a
                href="https://twitter.com/finarcapp"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-400 backdrop-blur transition hover:bg-white/10 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M18.244 2H21l-6.56 7.5L22 22h-6.828l-5.34-7.01L3.5 22H1l7.03-8.03L2 2h6.828l4.86 6.38L18.244 2Zm-2.396 18h1.885L8.162 3.89H6.16l9.688 16.11Z"/>
               </svg>
               <span className="hidden sm:inline">Follow on X</span>
             </a>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}