'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSession, verifyPassword, updatePassword } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { sc } from '@/lib/memberTheme'
import AppSidebar from '@/components/AppSidebar'
import AppBottomNav from '@/components/AppBottomNav'

function Box({ title, children }) {
  return (
    <div style={{ background: sc.cardBg, borderRadius: '14px', boxShadow: sc.shadow, padding: '20px', marginBottom: '16px' }}>
      <h2 style={{
        fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: '15px',
        color: sc.text, marginBottom: '14px',
      }}>{title}</h2>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', border: `1px solid ${sc.line}`, borderRadius: '9px',
  padding: '10px 12px', fontSize: '14px', fontFamily: theme.fontBody, color: sc.text, background: sc.bg,
}

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'ok' | 'error', message }

  useEffect(() => {
    const session = getSession()
    setEmail(session?.user?.email || '')
  }, [])

  const handleChangePassword = async () => {
    setStatus(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatus({ type: 'error', message: 'Please fill in all fields.' })
      return
    }
    if (newPassword.length < 6) {
      setStatus({ type: 'error', message: 'New password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New password and confirmation do not match.' })
      return
    }

    setSaving(true)
    try {
      const ok = await verifyPassword(email, currentPassword)
      if (!ok) {
        setStatus({ type: 'error', message: 'Current password is incorrect.' })
        setSaving(false)
        return
      }
      await updatePassword(newPassword)
      setStatus({ type: 'ok', message: 'Password updated successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      console.error(e)
      setStatus({ type: 'error', message: e.message || 'Could not update password, please try again.' })
    }
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: sc.bg }}>
      <AppSidebar active="profile" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(20px,3vw,40px) clamp(16px,3vw,24px)' }}>
          <Link href="/account" style={{ fontSize: '13px', color: sc.textSoft, textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
            ← Back to Profile
          </Link>

          <h1 style={{
            fontFamily: theme.fontDisplay, fontWeight: '600', fontSize: 'clamp(22px,2.6vw,28px)',
            color: sc.text, marginBottom: '18px', letterSpacing: '-0.01em'
          }}>Settings</h1>

          <Box title="Change Password">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: sc.textSoft, marginBottom: '5px' }}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: sc.textSoft, marginBottom: '5px' }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: sc.textSoft, marginBottom: '5px' }}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>

              {status && (
                <div style={{ fontSize: '12.5px', color: status.type === 'ok' ? '#0F7B3F' : theme.brass }}>
                  {status.message}
                </div>
              )}

              <button
                type="button"
                onClick={handleChangePassword}
                disabled={saving}
                style={{
                  alignSelf: 'flex-start', background: saving ? sc.line : theme.brass, color: '#FFFFFF',
                  border: 'none', borderRadius: '9px', padding: '10px 20px', fontSize: '13.5px', fontWeight: '700',
                  cursor: saving ? 'default' : 'pointer',
                }}
              >{saving ? 'Updating…' : 'Update Password'}</button>
            </div>
          </Box>
        </div>
      </div>

      <AppBottomNav active="profile" />

      <style jsx global>{`
        @media (max-width: 860px) {
          body { padding-bottom: 62px; }
        }
      `}</style>
    </div>
  )
}
