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
