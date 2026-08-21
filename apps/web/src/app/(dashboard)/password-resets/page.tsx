import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import PasswordResetsClient from './PasswordResetsClient';

export const dynamic = 'force-dynamic';

export default async function PasswordResetsPage() {
  const headersList = headers();
  const scopeHeader = headersList.get('x-user-scope');
  
  if (!scopeHeader) {
    redirect('/login');
  }

  const scope = JSON.parse(scopeHeader);
  const isRepOrAdmin = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');

  if (!isRepOrAdmin) {
    redirect('/');
  }

  return <PasswordResetsClient />;
}
