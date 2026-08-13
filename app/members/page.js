import { redirect } from 'next/navigation'

// The old standalone co-founder profile browser (member_profiles table) is
// retired — it was disconnected from the listing system's co_founder purpose
// type, so it showed every discoverable user regardless of what they'd
// actually listed for. Co-founder browsing now happens on the homepage,
// filtered to listings where the owner selected "co_founder" as a purpose.
export default function MembersPage() {
  redirect('/?type=co_founder')
}
