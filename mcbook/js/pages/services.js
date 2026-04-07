import { supabase } from '../supabase.js'
import { getSession } from '../auth.js'
import { setTopbarDate, loadSidebarUser } from '../ui.js'

const DOTS = ['dot-blue', 'dot-purple', 'dot-amber', 'dot-green']

const PMODE_LABELS = {
  free:        'Pay in person',
  noshow_only: 'Pay in person',  // legacy — treat same as free
  after:       'Charge after',
  upfront:     'Charge upfront',
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function durationToMins(s) {
  if (s.includes('1.5')) return 90
  if (s.includes('2 h')) return 120
  if (s.includes('1 h')) return 60
  return parseInt(s) || 30
}
function minsLabel(m) {
  if (m < 60) return `${m} minutes`
  if (m === 60) return '1 hour'
  if (m === 90) return '1.5 hours'
  if (m === 120) return '2 hours'
  return `${m} min`
}
function durationSelectValue(mins) {
  const map = { 15: '15 min', 20: '20 min', 30: '30 min', 45: '45 min',
                60: '1 hour', 90: '1.5 hours', 120: '2 hours' }
  return map[mins] ?? '30 min'
}

// ── State ─────────────────────────────────────────────────────────────────────
let uid = ''
let editId = null

// ── Render ────────────────────────────────────────────────────────────────────
async function loadServices() {
  const { data, error } = await supabase.from('services')
    .select('*').eq('client_id', uid).order('created_at', { ascending: true })
  if (error) { console.error(error); return }

  const list = document.querySelector('.services-list')
  list.innerHTML = ''
  ;(data ?? []).forEach((svc, i) => {
    const card = document.createElement('div')
    card.className = 'service-card'
    card.dataset.serviceId = svc.id
    card.innerHTML = `
      <div class="service-card-main">
        <div class="service-dot ${DOTS[i % 4]}">&#9986;</div>
        <div class="service-info">
          <div class="service-name">${svc.name}</div>
          <div class="service-tags">
            <span class="service-tag">${minsLabel(svc.duration_mins)}</span>
            <span class="service-tag price">$${Number(svc.price).toFixed(2)}</span>
            <span class="service-tag nosho">No-show: $${Number(svc.noshow_fee).toFixed(2)}</span>
            <span class="service-tag">${PMODE_LABELS[svc.payment_mode] ?? 'No-show protection'}</span>
          </div>
        </div>
        <div class="service-actions">
          <div class="service-active-toggle">
            <label class="toggle">
              <input type="checkbox" class="toggle-active" ${svc.active ? 'checked' : ''}>
              <span class="toggle-track"></span>
              <span class="toggle-thumb"></span>
            </label>
            ${svc.active ? 'Active' : 'Inactive'}
          </div>
          <div class="service-edit-btns">
            <button class="btn-edit">Edit</button>
            <button class="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    `
    list.appendChild(card)
  })
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const session = await getSession()
  if (!session) return
  uid = session.user.id
  setTopbarDate()
  loadSidebarUser(uid)

  await loadServices()

  const list   = document.querySelector('.services-list')
  const panel  = document.querySelector('.add-service-panel')
  const textInputs = panel.querySelectorAll('input[type="text"]')
  const nameInput  = textInputs[0]
  const descInput  = textInputs[1]
  const durSelect   = panel.querySelector('select')
  const pmodeSelect = panel.querySelector('#svc-pmode')
  const saveBtn     = panel.querySelector('.btn-primary')
  const cancelBtn   = panel.querySelector('.btn-cancel')

  function getNumInputs() { return panel.querySelectorAll('input[type="number"]') }
  function clearForm() {
    nameInput.value = ''; descInput.value = ''
    const nums = getNumInputs(); nums[0].value = ''; nums[1].value = ''
    durSelect.value = '30 min'; pmodeSelect.value = 'after'; editId = null
  }

  // Delegate: toggle active
  list.addEventListener('change', async e => {
    const toggle = e.target.closest('.toggle-active')
    if (!toggle) return
    const card   = toggle.closest('.service-card')
    const active = toggle.checked
    const label  = card.querySelector('.service-active-toggle')
    label.lastChild.textContent = active ? ' Active' : ' Inactive'
    await supabase.from('services').update({ active }).eq('id', card.dataset.serviceId)
  })

  // Delegate: delete / edit
  list.addEventListener('click', async e => {
    const card = e.target.closest('.service-card')
    if (!card) return
    const id = card.dataset.serviceId

    if (e.target.closest('.btn-delete')) {
      if (!window.confirm('Delete this service?')) return
      await supabase.from('services').delete().eq('id', id)
      await loadServices()
      return
    }

    if (e.target.closest('.btn-edit')) {
      const { data } = await supabase.from('services').select('*').eq('id', id).single()
      if (!data) return
      nameInput.value = data.name
      descInput.value = data.description ?? ''
      durSelect.value   = durationSelectValue(data.duration_mins)
      pmodeSelect.value = data.payment_mode ?? 'noshow_only'
      const nums = getNumInputs()
      nums[0].value = data.price
      nums[1].value = data.noshow_fee
      editId = id
      panel.scrollIntoView({ behavior: 'smooth' })
    }
  })

  // Save service (insert or update)
  saveBtn.addEventListener('click', async () => {
    const nums = getNumInputs()
    const payload = {
      name: nameInput.value.trim(),
      description: descInput.value.trim() || null,
      duration_mins: durationToMins(durSelect.value),
      price: parseFloat(nums[0].value) || 0,
      noshow_fee: parseFloat(nums[1].value) || 0,
      payment_mode: pmodeSelect.value || 'noshow_only',
    }
    if (!payload.name) return

    if (editId) {
      await supabase.from('services').update(payload).eq('id', editId)
    } else {
      await supabase.from('services').insert({ ...payload, client_id: uid, active: true })
    }
    clearForm()
    await loadServices()
  })

  cancelBtn.addEventListener('click', clearForm)
})
