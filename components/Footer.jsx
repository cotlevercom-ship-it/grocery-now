'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseFetch } from '@/lib/supabase'

export default function Footer() {
  const [infoPages, setInfoPages] = useState([])
  const [partnerPages, setPartnerPages] = useState([])
  const [settings, setSettings] = useState({ contact_email: '', whatsapp_number: '', facebook_url: '' })

  useEffect(() => {
    async function load() {
      try {
        const [pages, settingRows] = await Promise.all([
          supabaseFetch(`site_pages?select=*&is_active=eq.true&order=sort_order`),
          supabaseFetch(`app_settings?select=key,value&key=in.(contact_email,whatsapp_number,facebook_url)`),
        ])
        setInfoPages((pages || []).filter(p => p.section === 'info'))
        setPartnerPages((pages || []).filter(p => p.section === 'partner'))
        const map = { contact_email: '', whatsapp_number: '', facebook_url: '' }
        ;(settingRows || []).forEach(r => { map[r.key] = r.value || '' })
        setSettings(map)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  const linkHref = (p) => p.link_type === 'external' ? p.external_url : `/page/${p.slug}`

  const whatsappHref = settings.whatsapp_number
    ? `https://wa.me/88${settings.whatsapp_number.replace(/^0/, '')}`
    : ''

  const colTitleStyle = {
    color: '#faf7f0', fontWeight: '700', fontSize: '14px', marginBottom: '10px'
  }
  const linkStyle = {
    display: 'block', color: 'rgba(255,255,255,0.75)', fontSize: '13px',
    textDecoration: 'none', marginBottom: '8px'
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #163a2c 0%, #2d6a4f 100%)',
      color: 'rgba(255,255,255,0.75)',
      padding: '32px 16px 24px',
      marginTop: '24px',
      fontSize: '13px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ color: '#faf7f0', fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>
          🧺 GroceryNow
        </div>
        <div>আপনার এলাকার সেরা গ্রোসারি, ঘরে বসেই</div>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'center',
        maxWidth: '720px', margin: '0 auto'
      }}>
        {infoPages.length > 0 && (
          <div style={{ minWidth: '140px' }}>
            <div style={colTitleStyle}>Info</div>
            {infoPages.map(p => (
              <Link key={p.id} href={linkHref(p)} style={linkStyle}>{p.title}</Link>
            ))}
          </div>
        )}

        {partnerPages.length > 0 && (
          <div style={{ minWidth: '140px' }}>
            <div style={colTitleStyle}>Partner With Us</div>
            {partnerPages.map(p => (
              <Link key={p.id} href={linkHref(p)} style={linkStyle}>{p.title}</Link>
            ))}
          </div>
        )}

        {(settings.facebook_url || whatsappHref || settings.contact_email) && (
          <div style={{ minWidth: '140px' }}>
            <div style={colTitleStyle}>Social</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                  textDecoration: 'none'
                }}>📘</a>
              )}
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                  textDecoration: 'none'
                }}>💬</a>
              )}
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                  textDecoration: 'none'
                }}>✉️</a>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link href="/seller" style={{
          display: 'inline-block', color: '#faf7f0',
          border: '1px solid rgba(255,255,255,0.35)', borderRadius: '20px',
          padding: '8px 18px', fontSize: '13px', fontWeight: '600',
          textDecoration: 'none'
        }}>
          🏪 Start Your Shop
        </Link>

        <div style={{ marginTop: '14px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
          © ২০২৬ GroceryNow। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </div>
  )
}
