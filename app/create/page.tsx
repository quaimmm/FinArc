'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '@/lib/supabase'

const categories = [
  'Design',
  'Development',
  'Consulting',
  'Marketing',
  'Content',
  'Other',
]

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function CreatePage() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()

  const [amount, setAmount] = useState('150')
  const [description, setDescription] = useState('Logo design')
  const [expiry, setExpiry] = useState('7')
  const [partial, setPartial] = useState(false)

  const [clientName, setClientName] = useState('')
  const [reference, setReference] = useState('')
  const [autoReference, setAutoReference] = useState('FIN-REFERENCE')
  const [category, setCategory] = useState('Design')
  const [notes, setNotes] = useState('')

  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    setAutoReference(
      `FIN-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
    )
  }, [])

  const createdReference = reference.trim() || autoReference

  const expiryLabel = useMemo(() => {
    if (expiry === '1') return '24 hours'
    if (expiry === '7') return '7 days'
    if (expiry === '30') return '30 days'
    return `${expiry} days`
  }, [expiry])

  function validateForm() {
    if (!isConnected || !address) {
      setError('Please connect your wallet first.')
      return false
    }

    if (!amount || Number(amount) <= 0) {
      setError('Enter a valid amount.')
      return false
    }

    if (!description.trim()) {
      setError('Please enter a description.')
      return false
    }

    setError('')
    return true
  }

  async function handleGenerateLink() {
    if (!validateForm()) return

    try {
      setIsCreating(true)
      setError('')

      const requestId = `req-${Date.now()}`

      const payload = {
        id: requestId,
        amount: Number(amount),
        description: description.trim(),
        expiry_days: Number(expiry),
        partial,
        receiver: address!.toLowerCase(),
        owner_address: address!.toLowerCase(),
        created_at: new Date().toISOString(),
        status: 'pending',
        client_name: clientName.trim() || null,
        reference: createdReference,
        category,
        notes: notes.trim() || null,
      }

      const { data, error } = await supabase
        .from('payment_requests')
        .insert(payload)
        .select('id')
        .single()

      if (error) {
        throw error
      }

      const link = `${window.location.origin}/pay/${data.id}`
      setGeneratedLink(link)
      setCopied(false)
    } catch (err) {
      console.error('Create request failed:', err)
      setError('Could not create payment request. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleCopyLink() {
    if (!generatedLink) return
    await navigator.clipboard.writeText(generatedLink)
    setCopied(true)
  }

  async function handleShare() {
    if (!generatedLink) return

    const shareText = `Payment request for ${amount} USDC
${description.trim()}
Reference: ${createdReference}
${generatedLink}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Request',
          text: shareText,
        })
        return
      } catch {
        // fallback below
      }
    }

    await navigator.clipboard.writeText(shareText)
    setCopied(true)
  }

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2">
        <div className="finarc-panel p-8">
          <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            Studio
          </p>
          <h1 className="mt-3 font-[family:var(--font-cormorant)] text-5xl font-semibold leading-none text-white">
            Create Payment Request
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Build a cleaner, more professional request flow for crypto payments.
          </p>

          {isConnected && address && (
            <div className="mt-6 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300">
              Connected wallet: {shortenAddress(address)}
            </div>
          )}

          <div className="mt-8 space-y-6">
            <div>
              <label className="finarc-label">Amount (USDC)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="finarc-input mt-2"
                placeholder="150"
              />
            </div>

            <div>
              <label className="finarc-label">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="finarc-input mt-2"
                placeholder="Logo design"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="finarc-label">Client name</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="finarc-input mt-2"
                  placeholder="Acme Studio"
                />
              </div>

              <div>
                <label className="finarc-label">Reference</label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="finarc-input mt-2"
                  placeholder={createdReference}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="finarc-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="finarc-input mt-2"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="finarc-label">Expiry</label>
                <select
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="finarc-input mt-2"
                >
                  <option value="1">24 hours</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="finarc-label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="finarc-input mt-2"
                placeholder="Optional message for your client"
              />
            </div>

            <div className="finarc-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-300">Allow partial payment</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Let the payer send a custom amount
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPartial(!partial)}
                  className={`relative h-7 w-14 rounded-full transition ${
                    partial ? 'bg-white' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full transition ${
                      partial ? 'left-8 bg-black' : 'left-1 bg-white'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="finarc-card p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Receiver wallet
              </p>
              <p className="mt-2 break-all text-sm text-zinc-300">
                {isConnected && address ? address : 'Not connected'}
              </p>
            </div>

            {!isConnected && (
              <button
                type="button"
                onClick={() => connect({ connector: injected() })}
                className="finarc-button-secondary w-full"
              >
                Connect Wallet
              </button>
            )}

            {error && (
              <div className="rounded-2xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerateLink}
              disabled={isCreating}
              className="finarc-button-primary w-full disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Generate Payment Link'}
            </button>

            {generatedLink && (
              <div className="finarc-card p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Payment link created
                    </p>

                    <p className="mt-3 text-xl font-semibold text-white">
                      {amount} USDC
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">{description}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                          Client
                        </p>
                        <p className="mt-1 text-sm text-zinc-300">
                          {clientName || 'Not specified'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                          Reference
                        </p>
                        <p className="mt-1 text-sm text-zinc-300">
                          {createdReference}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                          Expires
                        </p>
                        <p className="mt-1 text-sm text-zinc-300">
                          {expiryLabel}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                          Wallet
                        </p>
                        <p className="mt-1 text-sm text-zinc-300">
                          {shortenAddress(address!)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                      Your client can review the details first, then approve the
                      payment from their wallet.
                    </div>

                    <details className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <summary className="cursor-pointer text-sm text-zinc-300">
                        Show link
                      </summary>
                      <p className="mt-3 break-all text-xs text-zinc-500">
                        {generatedLink}
                      </p>
                    </details>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="finarc-button-primary"
                      >
                        {copied ? 'Copied' : 'Copy Link'}
                      </button>

                      <button
                        type="button"
                        onClick={handleShare}
                        className="finarc-button-secondary"
                      >
                        Share
                      </button>

                      <a
                        href={generatedLink}
                        target="_blank"
                        rel="noreferrer"
                        className="finarc-button-secondary"
                      >
                        Open Preview
                      </a>
                    </div>
                  </div>

                  <div className="mx-auto md:mx-0">
                    <div className="rounded-[28px] border border-white/10 bg-white p-4 shadow-2xl">
                      <QRCodeSVG
                        value={generatedLink}
                        size={156}
                        bgColor="#ffffff"
                        fgColor="#111111"
                        includeMargin
                      />
                    </div>
                    <p className="mt-3 text-center text-xs text-zinc-500">
                      Scan to open payment page
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="finarc-panel p-8">
          <p className="text-sm text-zinc-500">Client View Preview</p>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-[rgba(8,18,38,0.50)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold">
                  Pay {amount || '0'} USDC
                </p>
                <p className="mt-2 text-zinc-400">
                  {description || 'No description'}
                </p>
              </div>

              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                {category}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">
                Secure wallet payment
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Review the request details first, then approve payment from your
                wallet.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="finarc-card p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Client
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  {clientName || 'Not specified'}
                </p>
              </div>

              <div className="finarc-card p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Reference
                </p>
                <p className="mt-2 text-sm text-zinc-300">{createdReference}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="finarc-card p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Expiry
                </p>
                <p className="mt-2 text-sm text-zinc-300">{expiryLabel}</p>
              </div>

              <div className="finarc-card p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Paid to
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  {isConnected && address
                    ? shortenAddress(address)
                    : 'Not connected'}
                </p>
              </div>
            </div>

            {notes.trim() && (
              <div className="finarc-card mt-4 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Notes
                </p>
                <p className="mt-2 text-sm text-zinc-300">{notes}</p>
              </div>
            )}

            {partial && (
              <input
                placeholder="Enter amount"
                className="finarc-input mt-4"
              />
            )}

            <button className="finarc-button-primary mt-6 w-full">
              Review & Pay
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}