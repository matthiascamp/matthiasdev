import { supabase } from '../supabase.js'
import { getSession } from '../auth.js'
import { setTopbarDate, loadSidebarUser } from '../ui.js'

const CHARGE_NOSHOW_URL = 'https://uijudgnqawtvjyjuyuwo.supabase.co/functions/v1/charge-noshow'
const PAGE_SIZE = 10
let currentPage = 1
let statusFilter = ''
let dateFilter = ''
let clientId = ''

// ── Helpers ──────────────────────────────────────────────────────────────────
function todayISO() { return new Date().toISOString().slice(0, 10) }
function weekStartISO() {
  const d = new Date(); const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  return d.toISOString().slice(0, 10)
}
function monthStartISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function fmtTime(t) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
function fmtDate(iso) {
  return new Date(iso + 'T00:00:00')
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

// ── Load & render ─────────────────────────────────────────────────────────────
async function loadBookings() {
  const today = todayISO()
  let q = supabase.from('bookings')
    .select('id, date, time, status, customers(name, email), services(name)', { count: 'exact' })
    .eq('client_id', clientId)
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  if (statusFilter) q = q.eq('status', statusFilter)
  if (dateFilter === 'Today') q = q.eq('date', today)
  else if (dateFilter === 'This Week') q = q.gte('date', weekStartISO())
  else if (dateFilter === 'This Month') q = q.gte('date', monthStartISO())

  const from = (currentPage - 1) * PAGE_SIZE
  const { data, count, error } = await q.range(from, from + PAGE_SIZE - 1)
  if (error) { console.error(error); return }

  const tbody = document.querySelector('.data-table tbody')
  tbody.innerHTML = ''
  for (const b of data ?? []) {
    const name = b.customers?.name ?? ''
    const isScheduled = b.status === 'scheduled'
    const tr = document.createElement('tr')
    tr.dataset.bookingId = b.id
    tr.innerHTML = `
      <td>
        <div class="customer-cell">
          <div class="cust-avatar">${initials(name)}</div>
          <div>
            <div class="cust-name">${name}</div>
            <div class="cust-email">${b.customers?.email ?? ''}</div>
          </div>
        </div>
      </td>
      <td>${b.services?.name ?? ''}</td>
      <td>${fmtDate(b.date)}</td>
      <td>${fmtTime(b.time)}</td>
      <td><span class="status-pill ${b.status}">${capitalize(b.status)}</span></td>
      <td>
        <div class="row-actions">
          <button class="btn-noshow" ${isScheduled ? '' : 'disabled'}>Mark No-show</button>
          <button class="btn-cancel" ${isScheduled ? '' : 'disabled'}>Cancel</button>
          <button class="btn-view">View</button>
        </div>
      </td>
    `
    tbody.appendChild(tr)
  }

  const total = count ?? 0
  const rangeEnd = Math.min(from + PAGE_SIZE, total)
  document.querySelector('.table-count').textContent =
    `Showing ${total > 0 ? from + 1 : 0}–${rangeEnd} of ${total} results`

  renderPagination(total)
}

function renderPagination(total) {
  const pageCount = Math.ceil(total / PAGE_SIZE)
  const from = (currentPage - 1) * PAGE_SIZE
  const rangeEnd = Math.min(from + PAGE_SIZE, total)

  const paginationSpan = document.querySelector('.pagination > span')
  if (paginationSpan)
    paginationSpan.textContent = `Showing ${total > 0 ? from + 1 : 0}–${rangeEnd} of ${total} bookings`

  const btnContainer = document.querySelector('.page-btns')
  if (!btnContainer) return
  btnContainer.innerHTML = ''

  const prev = document.createElement('button')
  prev.className = 'page-btn'
  prev.innerHTML = '&#8249;'
  prev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; loadBookings() } })
  btnContainer.appendChild(prev)

  const maxShown = Math.min(pageCount, 7)
  for (let i = 1; i <= maxShown; i++) {
    const btn = document.createElement('button')
    btn.className = 'page-btn' + (i === currentPage ? ' current' : '')
    btn.textContent = i
    btn.addEventListener('click', () => { currentPage = i; loadBookings() })
    btnContainer.appendChild(btn)
  }

  const next = document.createElement('button')
  next.className = 'page-btn'
  next.innerHTML = '&#8250;'
  next.addEventListener('click', () => { if (currentPage < pageCount) { currentPage++; loadBookings() } })
  btnContainer.appendChild(next)
}

async function cancelBooking(bookingId, buttonEl) {
  if (!confirm('Cancel this booking? This cannot be undone.')) return
  buttonEl.disabled    = true
  buttonEl.textContent = 'Cancelling\u2026'

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  if (error) {
    buttonEl.disabled    = false
    buttonEl.textContent = 'Cancel'
    alert('Failed to cancel booking: ' + error.message)
    return
  }

  const tr   = buttonEl.closest('tr')
  const pill = tr?.querySelector('.status-pill')
  if (pill) { pill.className = 'status-pill cancelled'; pill.textContent = 'Cancelled' }
  buttonEl.textContent = 'Cancelled'
  tr?.querySelector('.btn-noshow')?.setAttribute('disabled', '')
}

async function markNoshow(bookingId, buttonEl) {
  buttonEl.disabled    = true
  buttonEl.textContent = 'Charging\u2026'

  const session = await getSession()
  const res  = await fetch(CHARGE_NOSHOW_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + session.access_token,
    },
    body: JSON.stringify({ bookingId }),
  })
  const json = await res.json()

  if (json.success) {
    const tr   = buttonEl.closest('tr')
    const pill = tr?.querySelector('.status-pill')
    if (pill) { pill.className = 'status-pill noshow'; pill.textContent = 'No-show' }
    buttonEl.disabled    = true
    buttonEl.textContent = 'Mark No-show'
  } else {
    buttonEl.disabled    = false
    buttonEl.textContent = 'Mark No-show'
    alert('Charge failed: ' + (json.error || 'Unknown error'))
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const session = await getSession()
  if (!session) return
  clientId = session.user.id
  setTopbarDate()
  loadSidebarUser(clientId)

  await loadBookings()

  const filterInput = document.querySelector('.filter-input')
  const filterSelects = document.querySelectorAll('.filter-select')
  const statusSelect = filterSelects[0]
  const dateSelect = filterSelects[1]

  // Client-side text search (debounced)
  let debounce
  filterInput?.addEventListener('input', () => {
    clearTimeout(debounce)
    debounce = setTimeout(() => {
      const q = filterInput.value.toLowerCase()
      document.querySelectorAll('.data-table tbody tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none'
      })
    }, 300)
  })

  // Status filter
  const STATUS_MAP = { 'Scheduled': 'scheduled', 'Completed': 'completed', 'No-show': 'noshow', 'Cancelled': 'cancelled' }
  statusSelect?.addEventListener('change', () => {
    statusFilter = STATUS_MAP[statusSelect.value] ?? ''
    currentPage = 1; loadBookings()
  })

  // Date filter
  dateSelect?.addEventListener('change', () => {
    const v = dateSelect.value
    dateFilter = v === 'All Time' ? '' : v
    currentPage = 1; loadBookings()
  })

  // Mark no-show / cancel (delegated on tbody)
  document.querySelector('.data-table tbody')?.addEventListener('click', e => {
    const noShowBtn = e.target.closest('.btn-noshow')
    if (noShowBtn && !noShowBtn.disabled) {
      const id = noShowBtn.closest('tr')?.dataset.bookingId
      if (id) markNoshow(id, noShowBtn)
      return
    }
    const cancelBtn = e.target.closest('.btn-cancel')
    if (cancelBtn && !cancelBtn.disabled) {
      const id = cancelBtn.closest('tr')?.dataset.bookingId
      if (id) cancelBooking(id, cancelBtn)
    }
  })
})
