import { cookies } from 'next/headers';

export function getActiveOfferingId() {
  const cookieStore = cookies();
  const offeringId = cookieStore.get('active_offering_id');
  return offeringId?.value || null;
}
