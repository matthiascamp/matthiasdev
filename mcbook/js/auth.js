import { supabase } from './supabase.js'

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  await supabase.auth.signOut()
  window.location.href = 'login.html'
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session ?? null
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    window.location.href = 'login.html'
    return false
  }
  return session
}
