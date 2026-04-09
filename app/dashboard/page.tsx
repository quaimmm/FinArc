'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { supabase } from '@/lib/supabase'

type RequestRow = {
  id: string
  description: string
  amount: string
  status: string
  txHash?: string | null
  clientName?: string | null
  reference?: string | null
  category?: string | null
  notes?: string | null
  createdAt?: number
  receiver?: string | null
}

type PaymentRow = {
  payment_id: string
  status: string
  tx_hash: string | null
}

type PaymentRequestDbRow = {
  id: string
  description: string | null
  amount: string | number | null
  status: string | null
  client_name: string | null
  reference: string | null
  category: string | null
  notes: string | null
  created_at: string | null
  receiver: string | null
  owner_address: string | null
}

type FilterStatus = 'all' | 'paid' | 'pending'

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()

  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')

  useEffect(() => {
    async function loadRequests() {
      if (!isConnected || !address) {
        setRequests([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const wallet = address.trim()

        const { data: requestRows, error: requestError } = await supabase
          .from('payment_requests')
          .select(
            `
              id,
              description,
              amount,
              status,
              client_name,
              reference,
              category,
              notes,
              created_at,
              receiver,
              owner_address
            `
          )
          .or(`owner_address.ilike.${wallet},receiver.ilike.${wallet}`)
          .order('created_at', { ascending: false })

        if (requestError) {
          console.error('Dashboard requests fetch error:', requestError)
          setRequests([])
          return
        }

        const baseRequests: RequestRow[] = ((requestRows || []) as PaymentRequestDbRow[]).map(
          (r) => ({
            id: String(r.id),
            description: r.description ?? 'Untitled request',
            amount: String(r.amount ?? '0'),
            status: r.status ?? 'pending',
            clientName: r.client_name ?? null,
            reference: r.reference ?? null,
            category: r.category ?? null,
            notes: r.notes ?? null,
            createdAt: r.created_at ? new Date(r.created_at).getTime() : undefined,
            receiver: r.receiver ?? null,
            txHash: null,
          })
        )

        if (baseRequests.length === 0) {
          setRequests([])
          return
        }

        const requestIds = baseRequests.map((r) => r.id)

        const { data: payments, error: paymentError } = await supabase
          .from('payments')
          .select('payment_id, status, tx_hash')
          .in('payment_id', requestIds)

        if (paymentError) {
          console.error('Dashboard payments fetch error:', paymentError)
          setRequests(baseRequests)
          return
        }

        const paymentMap = new Map<string, PaymentRow>()

        ;(payments || []).forEach((p: PaymentRow) => {
          paymentMap.set(String(p.payment_id), p)
        })

        const mergedRequests: RequestRow[] = baseRequests.map((r) => {
          const payment = paymentMap.get(r.id)

          return {
            ...r,
            status: payment?.status || r.status || 'pending',
            txHash: payment?.tx_hash || null,
          }
        })

        setRequests(mergedRequests)
      } catch (err) {
        console.error('Dashboard load error:', err)
        setRequests([])
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
    window.addEventListener('focus', loadRequests)

    return () => {
      window.removeEventListener('focus', loadRequests)
    }
  }, [address, isConnected])

  const stats = useMemo(() => {
    const total = requests.length
    const paid = requests.filter((r) => r.status === 'paid').length
    const pending = requests.filter((r) => r.status !== 'paid').length

    const totalAmount = requests.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

    const paidAmount = requests
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

    return {
      total,
      paid,
      pending,
      totalAmount,
      paidAmount,
    }
  }, [requests])

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus =
        statusFilter === 'all' ? true : r.status === statusFilter

      const q = search.trim().toLowerCase()

      const matchesSearch =
        !q ||
        r.description?.toLowerCase().includes(q) ||
        r.clientName?.toLowerCase().includes(q) ||
        r.reference?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [requests, search, statusFilter])

  if (!isConnected || !address) {
    return (
      <main className="min-h-screen px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="finarc-panel p-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Dashboard
            </p>
            <h1 className="mt-3 font-[family:var(--font-cormorant)] text-5xl font-semibold leading-none text-white">
              Connect your wallet
            </h1>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Connect your wallet to view your payment requests and personal dashboard data.
            </p>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => connect({ connector: injected() })}
                className="finarc-button-primary"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            Control panel
          </p>
          <h1 className="mt-3 font-[family:var(--font-cormorant)] text-5xl font-semibold leading-none text-white">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Track payment requests, statuses, and request activity with a cleaner
            layer on top of Arc payments.
          </p>
          <div className="mt-4 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300">
            Connected wallet: {shortenAddress(address)}
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="finarc-card p-5">
            <p className="text-sm text-zinc-500">Total requests</p>
            <p className="mt-3 text-3xl font-semibold">{stats.total}</p>
          </div>

          <div className="finarc-card p-5">
            <p className="text-sm text-zinc-500">Paid</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-400">
              {stats.paid}
            </p>
          </div>

          <div className="finarc-card p-5">
            <p className="text-sm text-zinc-500">Pending</p>
            <p className="mt-3 text-3xl font-semibold text-amber-400">
              {stats.pending}
            </p>
          </div>

          <div className="finarc-card p-5">
            <p className="text-sm text-zinc-500">Paid volume</p>
            <p className="mt-3 text-3xl font-semibold">
              {stats.paidAmount.toFixed(2)} USDC
            </p>
          </div>
        </div>

        <div className="finarc-panel mb-6 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description, client, reference, category..."
              className="finarc-input md:max-w-md"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'finarc-button-primary' : 'finarc-button-secondary'}
              >
                All
              </button>

              <button
                onClick={() => setStatusFilter('paid')}
                className={statusFilter === 'paid' ? 'finarc-button-primary' : 'finarc-button-secondary'}
              >
                Paid
              </button>

              <button
                onClick={() => setStatusFilter('pending')}
                className={statusFilter === 'pending' ? 'finarc-button-primary' : 'finarc-button-secondary'}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="finarc-panel p-6 text-zinc-400">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="finarc-panel p-8 text-center">
            <p className="text-lg font-medium text-white">No requests for this wallet</p>
            <p className="mt-2 text-sm text-zinc-500">
              Create a new payment request to start building your wallet-based dashboard.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredRequests.map((r) => (
              <div key={r.id} className="finarc-panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-medium">{r.description}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {Number(r.amount || 0).toFixed(2)} USDC
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      r.status === 'paid'
                        ? 'border border-emerald-800 bg-emerald-950/60 text-emerald-300'
                        : 'border border-amber-800 bg-amber-950/60 text-amber-300'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="finarc-card p-3">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Client
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">
                      {r.clientName || 'Not specified'}
                    </p>
                  </div>

                  <div className="finarc-card p-3">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Reference
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">
                      {r.reference || 'Not set'}
                    </p>
                  </div>

                  <div className="finarc-card p-3">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Category
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">
                      {r.category || 'General'}
                    </p>
                  </div>

                  <div className="finarc-card p-3">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Created
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : 'Unknown'}
                    </p>
                  </div>
                </div>

                {r.notes && (
                  <div className="finarc-card mt-4 p-3">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Notes
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">{r.notes}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {r.txHash && (
                    <a
                      href={`https://testnet.arcscan.app/tx/${r.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="finarc-button-secondary"
                    >
                      View transaction
                    </a>
                  )}

                  <a
                    href={`/pay/${r.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="finarc-button-secondary"
                  >
                    Open request
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}