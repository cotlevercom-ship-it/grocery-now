// Conditional extra-field definitions per listing purpose type.
// Each field: { key, label, type: 'text'|'textarea'|'select', options?, placeholder? }
// Values are stored in listings.extra_fields as { [purposeType]: { [fieldKey]: value } }.

export const EXTRA_FIELD_CONFIG = {
  co_founder: {
    label: 'Co-founder details',
    fields: [
      { key: 'skills_needed', label: 'What skills/expertise are you looking for?', type: 'textarea', placeholder: 'e.g. technical co-founder with backend experience' },
      { key: 'equity_offered', label: 'Offering equity?', type: 'select', options: ['Yes', 'No'] },
      { key: 'equity_percent', label: 'Equity % (optional)', type: 'text', placeholder: 'e.g. 10-20%' },
      { key: 'commitment', label: 'Commitment expected', type: 'select', options: ['Full-time', 'Part-time'] },
      { key: 'stage', label: 'Current stage', type: 'select', options: ['Idea', 'MVP', 'Launched', 'Revenue-generating'] },
    ],
  },
  partner: {
    label: 'Partner details',
    fields: [
      { key: 'partnership_type', label: 'Type of partnership', type: 'text', placeholder: 'e.g. strategic, marketing, distribution' },
      { key: 'expectation', label: 'What are you looking for from a partner?', type: 'textarea' },
    ],
  },
  investor: {
    label: 'Investor details',
    fields: [
      { key: 'amount_needed', label: 'Minimum Investment Amount (৳)', type: 'text', placeholder: 'e.g. 10,00,000' },
      { key: 'investment_type', label: 'Investment type', type: 'select', options: ['Equity', 'Loan', 'Revenue-share'] },
      { key: 'return_type', label: 'Return type offered', type: 'select', options: ['Equity', 'Profit Sharing', 'Fixed Return', 'Convertible Note'], required: true },
      { key: 'roi_details', label: 'Expected ROI', type: 'select', options: ['Up to 10%', '11–20%', '21–30%', '31–50%', '50%+', 'Negotiable'], required: true },
      { key: 'investment_duration', label: 'Minimum Duration', type: 'select', options: ['Under 1 year', '1–2 years', '2–5 years', '5+ years', 'Negotiable'], required: true },
      { key: 'stage', label: 'Current stage', type: 'select', options: ['Idea', 'MVP', 'Revenue-generating', 'Profitable'] },
      { key: 'monthly_revenue', label: 'Current monthly revenue (optional)', type: 'text' },
    ],
  },
  employee: {
    label: 'Employee details',
    fields: [
      { key: 'position', label: 'Position/Role', type: 'text', placeholder: 'e.g. Frontend Developer' },
      { key: 'openings', label: 'Number of openings', type: 'text', placeholder: 'e.g. 2' },
      { key: 'salary_range', label: 'Salary range (optional)', type: 'text' },
      { key: 'employment_type', label: 'Employment type', type: 'select', options: ['Full-time', 'Part-time', 'Remote'] },
    ],
  },
  supplier: {
    label: 'Supplier details',
    fields: [
      { key: 'product', label: 'Product/service you supply', type: 'text' },
      { key: 'volume', label: 'Supply volume/capacity (optional)', type: 'text' },
    ],
  },
  buyer: {
    label: 'Buyer details',
    fields: [
      { key: 'product', label: 'Product/service you\u2019re buying', type: 'text' },
      { key: 'volume', label: 'Quantity/volume needed (optional)', type: 'text' },
    ],
  },
}

// Strip empty-string values from a single type's field map; drop the type entirely if nothing filled.
export function cleanExtraFieldsForType(type, values) {
  const config = EXTRA_FIELD_CONFIG[type]
  if (!config) return null
  const out = {}
  for (const f of config.fields) {
    const v = (values?.[f.key] ?? '').toString().trim()
    if (v) out[f.key] = v
  }
  return Object.keys(out).length ? out : null
}
// trigger redeploy 1786617717
// trigger redeploy 1786617906
// trigger redeploy 1786618177
// trigger redeploy 1786618557
// trigger redeploy 1786618991
// trigger redeploy 1786619229
// trigger redeploy 1786623213
