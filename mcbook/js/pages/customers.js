import { supabase } from '../supabase.js'
import { getSession } from '../auth.js'
import { setTopbarDate, loadSidebarUser } from '../ui.js'

// ── Helpers ──────────────────────────────────────────────────────────────────
function monthStartISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const session = await getSession()
  if (!session) return
  const uid = session.user.id
  setTopbarDate()
  loadSidebarUser(uid)

  // ── Stat chips (parallel) ─────────────────────────────────────────────────
  const [
    { count: totalCount },
    { count: newCount },
    { data: custBookings }
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('client_id', uid),
    supabase.from('customers').select('*', { count: 'exact', head: true })
      .eq('client_id', uid).gte('created_at', monthStartISO()),
    supabase.from('customers').select('id, bookings(id)').eq('client_id', uid)
  ])

  const chips = document.querySelectorAll('.stat-chip-val')
  if (chips[0]) chips[0].textContent = totalCount ?? 0
  if (chips[1]) chips[1].textContent = newCount ?? 0
  if (chips[2] && custBookings)
    chips[2].textContent = custBookings.filter(c => (c.bookings?.length ?? 0) >= 3).length

  // ── Customers table ───────────────────────────────────────────────────────
  const { data: customers } = await supabase.from('customers')
    .select('id, name, email, phone, created_at, bookings(id, status)')
    .eq('client_id', uid)
    .order('created_at', { ascending: false })
    .limit(10)

  const tbody = document.querySelector('.data-table tbody')
  tbody.innerHTML = ''
  ;(customers ?? []).forEach((c, i) => {
    const bookingCount = (c.bookings ?? []).filter(b => b.status !== 'cancelled').length
    const noshowCount = (c.bookings ?? []).filter(b => b.status === 'noshow').length
    const since = new Date(c.created_at)
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>
        <div class="customer-cell">
          <div class="cust-avatar c${(i % 8) + 1}">${initials(c.name)}</div>
          <div>
            <div class="cust-name">${c.name}</div>
            <div class="cust-since">Customer since ${MONTHS[since.getMonth()]} ${since.getFullYear()}</div>
          </div>
        </div>
      </td>
      <td>${c.email}</td>
      <td>${c.phone ?? '—'}</td>
      <td><span class="booking-count">${bookingCount}</span></td>
      <td><span class="noshow-count${noshowCount === 0 ? ' none' : ''}">${noshowCount}</span></td>
      <td><button class="btn-view">View</button></td>
    `
    tbody.appendChild(tr)
  })

  document.querySelector('.table-count').textContent =
    `Showing 1–${Math.min(10, customers?.length ?? 0)} of ${totalCount ?? 0}`

  // ── Client-side search ────────────────────────────────────────────────────
  document.querySelector('.filter-input')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase()
    document.querySelectorAll('.data-table tbody tr').forEach(tr => {
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none'
    })
  })
})
