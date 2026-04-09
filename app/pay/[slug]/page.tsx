'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { parseUnits } from 'viem'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useSendTransaction,
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { getPaymentStatus, savePayment } from '@/lib/payments'
import { supabase } from '@/lib/supabase'

type PaymentRequest = {
  id: string
  amount: number
  description: string
  expiry_days: number
  partial: boolean
  receiver: string
  owner_address: string
  created_at: string | null
  status: string | null
  client_name: string | null
  reference: string | null
  category: string | null
  notes: string | null
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function PayPage() {
  const params = useParams()
  const slug = params.slug as string

  const { address, isConnected, chain } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { sendTransactionAsync } = useSendTransaction()

  const [request, setRequest] = useState<PaymentRequest | null>(null)
  const [isLoadingRequest, setIsLoadingRequest] = useState(true)

  const [customAmount, setCustomAmount] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  const ARC_ID = 5042002

  useEffect(() => {
    async function loadRequest() {
      try {
        setIsLoadingRequest(true)

        const { data, error } = await supabase
          .from('payment_requests')
          .select('*')
          .eq('id', slug)
          .single()

        if (error) {
          console.error('Request load failed:', error)
          setRequest(null)
          return
        }

        setRequest(data)
        setPaymentStatus(data.status ?? null)
      } catch (err) {
        console.error('Request load failed:', err)
        setRequest(null)
      } finally {
        setIsLoadingRequest(false)
      }
    }

    if (slug) {
      loadRequest()
    }
  }, [slug])

  useEffect(() => {
    async function loadPaymentStatus() {
      if (!slug) return

      try {
        const payment = await getPaymentStatus(slug)

        if (!payment) {
          setTxHash(null)
          return
        }

        setPaymentStatus(payment.status)
        setTxHash(payment.tx_hash ?? null)
      } catch (err) {
        console.log('Payment status load failed:', err)
      }
    }

    loadPaymentStatus()
  }, [slug])

  const isPaid = paymentStatus === 'paid' || request?.status === 'paid'

  const isExpired = useMemo(() => {
    if (!request?.created_at) return false
    const createdAt = new Date(request.created_at).getTime()

    if (Number.isNaN(createdAt)) return false

    const expiresAt = createdAt + request.expiry_days * 24 * 60 * 60 * 1000
    return Date.now() > expiresAt
  }, [request])

  const payableAmount = request?.partial
    ? customAmount.trim() || '0'
    : String(request?.amount ?? '0')

  async function handlePay() {
    try {
      setError(null)

      if (!request) {
        setError('Payment request not found.')
        return
      }

      if (isPaid) {
        setError('This payment request has already been paid.')
        return
      }

      if (isExpired) {
        setError('This payment request has expired.')
        return
      }

      if (!isConnected) {
        setError('Please connect your wallet first.')
        return
      }

      if (chain?.id !== ARC_ID) {
        setError('Please switch to Arc Testnet first.')
        return
      }

      if (!request.receiver) {
        setError('Missing receiver address.')
        return
      }

      if (!payableAmount || Number(payableAmount) <= 0) {
        setError('Enter a valid amount.')
        return
      }

      setIsSending(true)

      setPaymentStatus('pending')

      const hash = await sendTransactionAsync({
        to: request.receiver as `0x${string}`,
        value: parseUnits(payableAmount, 18),
      })

      const paidRow = await savePayment({
        paymentId: request.id,
        walletAddress: address,
        amount: payableAmount,
        chainId: chain?.id,
        txHash: hash,
        status: 'paid',
      })

      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({ status: 'paid' })
        .eq('id', request.id)

      if (updateError) {
        console.error('Request status update failed:', updateError)
      }

      setRequest((prev) => (prev ? { ...prev, status: 'paid' } : prev))
      setTxHash(hash)
      setPaymentStatus(paidRow.status)
    } catch (err) {
      console.error('handlePay error:', err)
      setError('Transaction failed or payment status could not be saved.')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoadingRequest) {
    return (
      <main className="min-h-screen px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-2xl">
          <div className="finarc-panel p-8 text-center">
            Loading payment request...
          </div>
        </div>
      </main>
    )
  }

  if (!request) {
    return (
      <main className="min-h-screen px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-2xl">
          <div className="finarc-panel p-8 text-center">
            <p className="text-2xl font-semibold text-white">
              Payment not found
            </p>
            <p className="mt-3 text-sm text-zinc-400">
              This payment request does not exist or is no longer available.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-2xl">
        <div className="finarc-panel p-8">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Payment request
            </p>
            <h1 className="mt-3 font-[family:var(--font-cormorant)] text-5xl font-semibold leading-none text-white">
              FinArc
            </h1>
            <p className="mt-3 text-sm text-zinc-400">
              Structured payment request on Arc
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-4xl font-semibold">{request.amount} USDC</p>
            <p className="mt-3 text-zinc-400">{request.description}</p>
            <p className="mt-3 text-sm text-zinc-500">
              Expires in {request.expiry_days}{' '}
              {request.expiry_days === 1 ? 'day' : 'days'}
            </p>
          </div>

          {isExpired && !isPaid && (
            <div className="mt-6 rounded-2xl border border-amber-800 bg-amber-950/30 p-4 text-sm text-amber-300">
              This payment request has expired.
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="finarc-card p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Client
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                {request.client_name || 'Not specified'}
              </p>
            </div>

            <div className="finarc-card p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Reference
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                {request.reference || 'Not set'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="finarc-card p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Category
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                {request.category || 'Not set'}
              </p>
            </div>

            <div className="finarc-card p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Paid to
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                {shortenAddress(request.receiver)}
              </p>
            </div>
          </div>

          <div className="finarc-card mt-4 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Receiver wallet
            </p>
            <p className="mt-2 break-all text-sm text-zinc-300">
              {request.receiver}
            </p>
          </div>

          {request.notes && (
            <div className="finarc-card mt-4 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Notes
              </p>
              <p className="mt-2 text-sm text-zinc-300">{request.notes}</p>
            </div>
          )}

          {request.partial && (
            <div className="mt-4">
              <label className="finarc-label mb-2 block">Payment amount</label>
              <input
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="finarc-input"
              />
            </div>
          )}

          <div className="mt-6 space-y-4">
            {!isConnected ? (
              <button
                onClick={() => connect({ connector: injected() })}
                className="finarc-button-primary w-full"
              >
                Connect Wallet
              </button>
            ) : (
              <>
                <div className="finarc-card p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Connected wallet
                  </p>
                  <p className="mt-2 break-all text-sm text-zinc-300">
                    {address}
                  </p>
                </div>

                {chain?.id !== ARC_ID && (
                  <button
                    onClick={() => switchChain({ chainId: ARC_ID })}
                    className="finarc-button-primary w-full"
                  >
                    Switch to Arc Testnet
                  </button>
                )}

                <button
                  onClick={handlePay}
                  disabled={
                    isSending || !request.receiver || isPaid || isExpired
                  }
                  className="finarc-button-primary w-full disabled:opacity-50"
                >
                  {isSending
                    ? 'Processing...'
                    : isPaid
                    ? 'Already Paid'
                    : isExpired
                    ? 'Expired'
                    : 'Pay Now'}
                </button>

                <button
                  onClick={() => disconnect()}
                  className="finarc-button-secondary w-full"
                >
                  Disconnect
                </button>
              </>
            )}

            {paymentStatus && (
              <div className="finarc-card p-4">
                <p className="text-sm text-zinc-300">
                  Payment status:{' '}
                  <span className="font-medium">{paymentStatus}</span>
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {txHash && (
              <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-4">
                <p className="text-sm text-emerald-300">
                  Payment submitted successfully
                </p>
                <a
                  href={`https://testnet.arcscan.app/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-xs text-emerald-200 underline"
                >
                  View transaction on Arcscan
                </a>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-zinc-600">
            Request ID: {request.id}
          </p>
        </div>
      </div>
    </main>
  )
}