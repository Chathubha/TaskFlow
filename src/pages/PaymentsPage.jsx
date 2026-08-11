import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Wallet,
} from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { formatMoney } from '../lib/utils'
import Avatar from '../components/Avatar'

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Payments — salary management + monthly payment tracking.
// Admins manage salaries and mark monthly payments paid/pending.
// Employees get a read-only view of their own salary and history.
export default function PaymentsPage() {
  const { user, isAdmin } = useAuth()
  const [members, setMembers] = useState([])
  const [salaries, setSalaries] = useState({})
  const [payments, setPayments] = useState([])
  const [month, setMonth] = useState(currentMonth())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')

  // Salary modal state
  const [salaryFor, setSalaryFor] = useState(null) // member id
  const [salaryValue, setSalaryValue] = useState('')
  const [savingSalary, setSavingSalary] = useState(false)

  const monthDate = `${month}-01`

  const load = useCallback(async () => {
    const membersRes = await supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url')
      .order('full_name')
    const salariesRes = await supabase.from('salaries').select('user_id, monthly_amount')

    let paymentsRes
    if (isAdmin) {
      paymentsRes = await supabase.from('payments').select('*').eq('month', monthDate)
    } else {
      paymentsRes = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false })
    }

    if (membersRes.error || salariesRes.error || paymentsRes.error) {
      setError(membersRes.error?.message ?? salariesRes.error?.message ?? paymentsRes.error?.message)
      setLoading(false)
      return
    }

    setMembers(membersRes.data ?? [])
    setSalaries(Object.fromEntries((salariesRes.data ?? []).map((s) => [s.user_id, Number(s.monthly_amount)])))
    setPayments(paymentsRes.data ?? [])
    setError(null)
    setLoading(false)
  }, [isAdmin, user.id, monthDate])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const paymentMap = useMemo(() => Object.fromEntries(payments.map((p) => [p.user_id, p])), [payments])

  const payrollTotal = useMemo(
    () => Object.values(salaries).reduce((sum, amount) => sum + (Number(amount) || 0), 0),
    [salaries],
  )
  const paidTotal = useMemo(
    () => payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    [payments],
  )
  const pendingTotal = useMemo(
    () => payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    [payments],
  )

  const openSalary = (member) => {
    setSalaryFor(member)
    setSalaryValue(salaries[member.id] != null ? String(salaries[member.id]) : '')
  }

  const saveSalary = async (e) => {
    e.preventDefault()
    const amount = Number(salaryValue)
    if (Number.isNaN(amount) || amount < 0) return
    setSavingSalary(true)
    setError(null)
    const { error: saveError } = await supabase
      .from('salaries')
      .upsert({ user_id: salaryFor.id, monthly_amount: amount }, { onConflict: 'user_id' })
    setSavingSalary(false)
    if (saveError) {
      setError(saveError.message)
      return
    }
    setSalaryFor(null)
    setNotice(`${salaryFor.full_name}'s salary saved.`)
    load()
  }

  const generatePayments = async () => {
    setError(null)
    const rows = members
      .filter((m) => salaries[m.id] != null && !paymentMap[m.id])
      .map((m) => ({ user_id: m.id, month: monthDate, amount: salaries[m.id], status: 'pending' }))
    if (rows.length === 0) {
      setNotice('All salaried employees already have a payment for this month.')
      return
    }
    const { error: insertError } = await supabase.from('payments').insert(rows)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setNotice(`Generated ${rows.length} payment record(s).`)
    load()
  }

  const createPayment = async (member) => {
    setError(null)
    const { error: insertError } = await supabase
      .from('payments')
      .insert({ user_id: member.id, month: monthDate, amount: salaries[member.id], status: 'pending' })
    if (insertError) {
      setError(insertError.message)
      return
    }
    load()
  }

  const markPaid = async (userId) => {
    setError(null)
    const today = new Date().toISOString().slice(0, 10)
    const { error: updateError } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_on: today })
      .eq('user_id', userId)
      .eq('month', monthDate)
    if (updateError) {
      setError(updateError.message)
      return
    }
    load()
  }

  const revertPaid = async (userId) => {
    setError(null)
    const { error: updateError } = await supabase
      .from('payments')
      .update({ status: 'pending', paid_on: null })
      .eq('user_id', userId)
      .eq('month', monthDate)
    if (updateError) {
      setError(updateError.message)
      return
    }
    load()
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Could not load payments: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Payments</h2>
          <p className="text-sm text-slate-500">
            {isAdmin ? 'Manage salaries and monthly payments.' : 'Your salary and payment history.'}
          </p>
        </div>
        {isAdmin && (
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            Month
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Wallet className="size-5" />
          </span>
          <div>
            <p className="text-xl font-bold leading-tight text-slate-900">{formatMoney(payrollTotal)}</p>
            <p className="text-xs font-medium text-slate-500">Monthly payroll{isAdmin ? ` (${month})` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </span>
          <div>
            <p className="text-xl font-bold leading-tight text-slate-900">{formatMoney(paidTotal)}</p>
            <p className="text-xs font-medium text-slate-500">Paid this month</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <RefreshCw className="size-5" />
          </span>
          <div>
            <p className="text-xl font-bold leading-tight text-slate-900">{formatMoney(pendingTotal)}</p>
            <p className="text-xs font-medium text-slate-500">Pending this month</p>
          </div>
        </div>
      </div>

      {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">{notice}</p>}
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}

      {isAdmin ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Employees</h3>
            <button
              type="button"
              onClick={generatePayments}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
            >
              <Plus className="size-3.5" />
              Generate payments for {month}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-semibold">Employee</th>
                  <th className="px-4 py-3 font-semibold">Monthly salary</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Paid on</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const salary = salaries[member.id]
                  const payment = paymentMap[member.id]
                  return (
                    <tr key={member.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={member.full_name} id={member.id} avatarUrl={member.avatar_url} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800">{member.full_name}</p>
                            <p className="truncate text-xs text-slate-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {salary != null ? formatMoney(salary) : <span className="text-slate-300">Not set</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {payment ? formatMoney(payment.amount) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {payment ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              payment.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {payment.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">Not generated</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{payment?.paid_on ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openSalary(member)}
                            title="Set salary"
                            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                          >
                            <Pencil className="size-3.5" />
                            {salary != null ? 'Edit' : 'Set'}
                          </button>
                          {!payment && salary != null && (
                            <button
                              type="button"
                              onClick={() => createPayment(member)}
                              className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
                            >
                              Create
                            </button>
                          )}
                          {payment?.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => markPaid(member.id)}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                            >
                              <CircleDollarSign className="size-3.5" />
                              Mark paid
                            </button>
                          )}
                          {payment?.status === 'paid' && (
                            <button
                              type="button"
                              onClick={() => revertPaid(member.id)}
                              className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
                            >
                              Revert
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Banknote className="size-5" />
            </span>
            <div>
              <p className="text-xl font-bold leading-tight text-slate-900">
                {salaries[user.id] != null ? formatMoney(salaries[user.id]) : 'Not set'}
              </p>
              <p className="text-xs font-medium text-slate-500">Your monthly salary</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-semibold">Month</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Paid on</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {new Date(`${p.month}T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatMoney(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {p.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.paid_on ?? '—'}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                      No payment records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Salary modal */}
      {salaryFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setSalaryFor(null)}>
          <form
            onSubmit={saveSalary}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-900">Set salary</h3>
            <p className="mt-0.5 text-sm text-slate-500">{salaryFor.full_name}</p>
            <label className="mt-4 mb-1 block text-xs font-semibold text-slate-600">Monthly amount (LKR)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={salaryValue}
              onChange={(e) => setSalaryValue(e.target.value)}
              placeholder="e.g. 75000"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSalaryFor(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingSalary || !salaryValue}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingSalary && <Loader2 className="size-4 animate-spin" />}
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
