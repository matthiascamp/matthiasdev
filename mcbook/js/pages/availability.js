import { supabase } from '../supabase.js'
import { getSession } from '../auth.js'
import { setTopbarDate, loadSidebarUser } from '../ui.js'

// Row index → day_of_week: Mon(1) Tue(2) Wed(3) Thu(4) Fri(5) Sat(6) Sun(0)
const DOW = [1, 2, 3, 4, 5, 6, 0]

// ── Helpers ──────────────────────────────────────────────────────────────────
function to12h(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
function to24h(t) {
  if (!t) return '09:00'
  const [time, ampm] = t.split(' ')
  let [h, m] = time.split(':').map(Number)
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
function fmtBlockedDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} (${DAYS[d.getDay()]})`
}

// ── State ─────────────────────────────────────────────────────────────────────
let uid = ''

// ── Generate 30-min time option list 6:00 AM – 10:00 PM ──────────────────────
function timeOptions() {
  const opts = []
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break
      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12  = h % 12 || 12
      opts.push(`${h12}:${String(m).padStart(2, '0')} ${ampm}`)
    }
  }
  return opts
}

function populateSelect(sel, value) {
  sel.innerHTML = ''
  for (const t of timeOptions()) {
    const opt = document.createElement('option')
    opt.value = opt.textContent = t
    sel.appendChild(opt)
  }
  if (value) sel.value = value
}

// ── Load weekly schedule ──────────────────────────────────────────────────────
async function loadWeeklySchedule() {
  const { data } = await supabase.from('availability_rules')
    .select('*').eq('client_id', uid).order('day_of_week')

  document.querySelectorAll('.week-row').forEach((row, i) => {
    const checkbox  = row.querySelector('input[type="checkbox"]')
    const timeRange = row.querySelector('.time-range')
    const dayClosed = row.querySelector('.day-closed')
    const selects   = row.querySelectorAll('.time-select')

    // Always populate select options with full 30-min range
    if (selects[0]) populateSelect(selects[0], '9:00 AM')
    if (selects[1]) populateSelect(selects[1], '5:00 PM')

    const rule = data?.find(r => r.day_of_week === DOW[i])
    if (rule) {
      checkbox.checked = rule.enabled
      if (selects[0]) selects[0].value = to12h(rule.start_time)
      if (selects[1]) selects[1].value = to12h(rule.end_time)
    }

    const applyEnabled = (on) => {
      if (timeRange) timeRange.style.display = on ? '' : 'none'
      if (dayClosed) dayClosed.style.display = on ? 'none' : ''
    }
    applyEnabled(checkbox.checked)
    checkbox.addEventListener('change', () => applyEnabled(checkbox.checked))
  })
}

// ── Load blocked dates ────────────────────────────────────────────────────────
async function loadBlockedDates() {
  const { data } = await supabase.from('blocked_dates')
    .select('*').eq('client_id', uid).order('date', { ascending: true })

  const blockedList = document.querySelector('.blocked-list')
  blockedList.innerHTML = ''
  for (const bd of data ?? []) {
    const div = document.createElement('div')
    div.className = 'blocked-item'
    div.dataset.blockedId = bd.id
    div.innerHTML = `
      <div class="blocked-item-left">
        <span class="blocked-icon">&#128683;</span>
        <div>
          <div class="blocked-label">${bd.label ?? 'Blocked'}</div>
          <div class="blocked-note">${fmtBlockedDate(bd.date)}</div>
        </div>
      </div>
      <button class="btn-remove" title="Remove">&#215;</button>
    `
    blockedList.appendChild(div)
  }
}

// ── Load booking settings ─────────────────────────────────────────────────────
async function loadBookingSettings() {
  const { data } = await supabase.from('booking_settings')
    .select('*').eq('client_id', uid).limit(1).maybeSingle()
  if (!data) return

  const slotRows   = document.querySelectorAll('.slot-row')
  const slotSel    = slotRows[0]?.querySelector('select')
  const advanceSel = slotRows[1]?.querySelector('select')
  const noticeSel  = slotRows[2]?.querySelector('select')

  if (slotSel)    slotSel.value    = `${data.slot_duration_mins} minutes`
  if (advanceSel) advanceSel.value = `${data.advance_window_weeks} weeks`
  if (noticeSel)  noticeSel.value  = data.min_notice_hours === 1
    ? '1 hour' : `${data.min_notice_hours} hours`
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const session = await getSession()
  if (!session) return
  uid = session.user.id
  setTopbarDate()
  loadSidebarUser(uid)

  await Promise.all([loadWeeklySchedule(), loadBlockedDates(), loadBookingSettings()])

  const saveBtns = document.querySelectorAll('.btn-save')

  // Save weekly schedule
  saveBtns[0]?.addEventListener('click', async () => {
    const rows = []
    document.querySelectorAll('.week-row').forEach((row, i) => {
      const checkbox = row.querySelector('input[type="checkbox"]')
      const selects  = row.querySelectorAll('.time-select')
      rows.push({
        client_id:   uid,
        day_of_week: DOW[i],
        enabled:     checkbox.checked,
        start_time:  selects[0] ? to24h(selects[0].value) : '09:00',
        end_time:    selects[1] ? to24h(selects[1].value) : '17:00'
      })
    })
    const { error } = await supabase.from('availability_rules')
      .upsert(rows, { onConflict: 'client_id,day_of_week' })
    if (!error) alert('Schedule saved.')
    else console.error(error)
  })

  // Save booking settings
  saveBtns[1]?.addEventListener('click', async () => {
    const slotRows   = document.querySelectorAll('.slot-row')
    const slotSel    = slotRows[0]?.querySelector('select')
    const advanceSel = slotRows[1]?.querySelector('select')
    const noticeSel  = slotRows[2]?.querySelector('select')
    const { error } = await supabase.from('booking_settings').upsert({
      client_id:            uid,
      slot_duration_mins:   parseInt(slotSel?.value   || '30'),
      advance_window_weeks: parseInt(advanceSel?.value || '4'),
      min_notice_hours:     parseInt(noticeSel?.value  || '2')
    }, { onConflict: 'client_id' })
    if (!error) alert('Settings saved.')
    else console.error(error)
  })

  // Remove blocked date (delegated — outside loadBlockedDates so no duplicate listeners)
  document.querySelector('.blocked-list')?.addEventListener('click', async e => {
    const btn = e.target.closest('.btn-remove')
    if (!btn) return
    const id = btn.closest('.blocked-item')?.dataset.blockedId
    if (id) {
      await supabase.from('blocked_dates').delete().eq('id', id)
      loadBlockedDates()
    }
  })

  // Add blocked date
  document.querySelector('.btn-add-block')?.addEventListener('click', async () => {
    const inputs = document.querySelectorAll('.add-blocked-form input')
    const dateVal  = inputs[0]?.value
    const labelVal = inputs[1]?.value.trim() || null
    if (!dateVal) return
    await supabase.from('blocked_dates').insert({ client_id: uid, date: dateVal, label: labelVal })
    if (inputs[0]) inputs[0].value = ''
    if (inputs[1]) inputs[1].value = ''
    loadBlockedDates()
  })
})
