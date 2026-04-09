import { supabase } from './supabase'

type SavePaymentParams = {
  paymentId: string
  walletAddress?: string
  amount?: string
  chainId?: number
  txHash?: string | null
  status: 'paid'
}

export async function savePayment(params: SavePaymentParams) {
  const payload = {
    payment_id: params.paymentId,
    wallet_address: params.walletAddress ?? null,
    amount: params.amount ? Number(params.amount) : null,
    chain_id: params.chainId ?? null,
    tx_hash: params.txHash ?? null,
    status: params.status,
  }

  const { data, error } = await supabase
    .from('payments')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('savePayment error:', error)
    throw error
  }

  console.log('savePayment success:', data)
  return data
}

export async function getPaymentStatus(paymentId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('payment_id', paymentId)
    .maybeSingle()

  if (error) {
    console.error('getPaymentStatus error:', error)
    throw error
  }

  return data
}