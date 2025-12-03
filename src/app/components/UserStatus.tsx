import { getCurrentUser } from '@/lib/get-current-user';
import { LogoutButton } from './LogoutButton';

export default async function UserStatus() {
  const user = await getCurrentUser();

  if (!user) {
    return <span className="text-sm text-gray-500">Inte inloggad</span>;
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-700">Inloggad som {user.email}</span>
      <LogoutButton />
    </div>
  );
}
