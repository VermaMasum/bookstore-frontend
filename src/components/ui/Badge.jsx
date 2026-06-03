const styles = {
  PENDING:       { bg: '#FFFAE6', color: '#974F0C', border: '#FFE380' },
  RECEIVED:      { bg: '#E3FCEF', color: '#006644', border: '#79E2B0' },
  PARTIAL:       { bg: '#FFEBE6', color: '#BF2600', border: '#FFBDAD' },
  DISPATCHED:    { bg: '#DEEBFF', color: '#0052CC', border: '#B3D4FF' },
  DELIVERED:     { bg: '#E3FCEF', color: '#006644', border: '#79E2B0' },
  CANCELLED:     { bg: '#FFEBE6', color: '#BF2600', border: '#FFBDAD' },
  LOCAL:         { bg: '#F4F5F7', color: '#42526E', border: '#DFE1E6' },
  EXTERNAL:      { bg: '#EAE6FF', color: '#403294', border: '#C0B6F2' },
  B2B:           { bg: '#DEEBFF', color: '#0052CC', border: '#B3D4FF' },
  B2C:           { bg: '#E3FCEF', color: '#006644', border: '#79E2B0' },
  CASH:          { bg: '#F4F5F7', color: '#42526E', border: '#DFE1E6' },
  BANK_TRANSFER: { bg: '#DEEBFF', color: '#0052CC', border: '#B3D4FF' },
  CHEQUE:        { bg: '#FFFAE6', color: '#974F0C', border: '#FFE380' },
  UPI:           { bg: '#EAE6FF', color: '#403294', border: '#C0B6F2' },
}

export default function Badge({ value }) {
  const s = styles[value] || { bg: '#F4F5F7', color: '#42526E', border: '#DFE1E6' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {value?.replace(/_/g, ' ')}
    </span>
  )
}
