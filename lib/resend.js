const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.OTP_FROM_EMAIL || 'Cot Lever <onboarding@resend.dev>'

export async function sendOtpEmail(email, code, purpose) {
  const subject = purpose === 'signup'
    ? 'Verify your email — Cot Lever'
    : purpose === 'merchant_reset'
    ? 'Reset your PIN — Cot Lever'
    : 'Reset your password — Cot Lever'

  const heading = purpose === 'signup'
    ? 'Verify your email'
    : purpose === 'merchant_reset'
    ? 'Reset your merchant PIN'
    : 'Reset your password'

  const body = purpose === 'signup'
    ? 'Use the code below to verify your email and finish creating your Cot Lever account.'
    : purpose === 'merchant_reset'
    ? 'Use the code below to reset your Cot Lever merchant PIN.'
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
