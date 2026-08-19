const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.OTP_FROM_EMAIL || 'Cot Lever <onboarding@resend.dev>'

export async function sendOtpEmail(email, code, purpose) {
  const subject = purpose === 'signup'
    ? 'Verify your email — Cot Lever'
    : purpose === 'admin_reset'
    ? 'Reset your admin password — Cot Lever'
    : 'Reset your password — Cot Lever'

  const heading = purpose === 'signup'
    ? 'Verify your email'
    : purpose === 'admin_reset'
    ? 'Reset your admin password'
    : 'Reset your password'

  const body = purpose === 'signup'
    ? 'Use the code below to verify your email and finish creating your Cot Lever account.'
    : purpose === 'admin_reset'
    ? 'Use the code below to reset your Cot Lever admin panel password.'
    : 'Use the code below to reset your Cot Lever account password.'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px; background: #faf9f7;">
      <div style="text-align:center; margin-bottom: 24px;">
        <span style="display:inline-block; background:#0a0a0a; color:white; font-weight:700; font-size:15px; padding:8px 16px; border-radius:8px;">Cot Lever</span>
      </div>
      <h2 style="color:#0a0a0a; font-size:18px; margin: 0 0 10px; text-align:center;">${heading}</h2>
      <p style="color:#6b6b6b; font-size:14px; line-height:1.6; text-align:center; margin: 0 0 24px;">${body}</p>
      <div style="text-align:center; margin-bottom:24px;">
        <span style="display:inline-block; font-size:32px; font-weight:700; letter-spacing:8px; color:#dc2626; background:white; border:1.5px solid #e8e6e2; border-radius:10px; padding:14px 20px;">${code}</span>
      </div>
      <p style="color:#999; font-size:12px; text-align:center; margin:0;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: email, subject, html }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to send email: ${err}`)
  }
  return res.json()
}

export async function sendConnectionRequestEmail(toEmail, { fromName, fromRoleTitle, fromEmail, message, profileUrl }) {
  const subject = `${fromName} wants to connect with you — Cot Lever`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 460px; margin: 0 auto; padding: 32px 24px; background: #faf9f7;">
      <div style="text-align:center; margin-bottom: 24px;">
        <span style="display:inline-block; background:#0a0a0a; color:white; font-weight:700; font-size:15px; padding:8px 16px; border-radius:8px;">Cot Lever</span>
      </div>
      <h2 style="color:#0a0a0a; font-size:18px; margin: 0 0 6px; text-align:center;">${fromName} wants to connect</h2>
      <p style="color:#6b6b6b; font-size:13px; text-align:center; margin: 0 0 20px;">${fromRoleTitle || ''}</p>
      ${message ? `<div style="background:white; border:1.5px solid #e8e6e2; border-radius:10px; padding:16px 18px; margin-bottom:20px;"><p style="color:#0a0a0a; font-size:14px; line-height:1.6; margin:0; white-space:pre-wrap;">${message}</p></div>` : ''}
      <p style="color:#6b6b6b; font-size:13px; line-height:1.6; text-align:center; margin: 0 0 20px;">
        You can reply directly to this email to reach them at <strong>${fromEmail}</strong>${profileUrl ? `, or view their full profile below.` : '.'}
      </p>
      ${profileUrl ? `<div style="text-align:center;"><a href="${profileUrl}" style="display:inline-block; background:#dc2626; color:white; font-weight:600; font-size:13px; padding:10px 20px; border-radius:8px; text-decoration:none;">View Profile</a></div>` : ''}
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: toEmail, reply_to: fromEmail, subject, html }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to send email: ${err}`)
  }
  return res.json()
}
