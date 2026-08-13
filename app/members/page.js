import { redirect } from 'next/navigation'

// Retired: the old standalone co-founder profile browser (member_profiles
// table) was already disconnected from the listing system. Co-founder
// discovery is now its own free, separate flow at /cofounder.
export default function MembersPage() {
  redirect('/cofounder')
}
