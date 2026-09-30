import { getTailorProfile } from './actions';
import { ProfileClient } from './ProfileClient';

export const metadata = {
  title: 'My Profile — Madinki',
  description: 'View and manage your tailor profile, shop metrics, and account settings.',
};

export default async function ProfilePage() {
  const { data: profile, error } = await getTailorProfile();

  return <ProfileClient initialProfile={profile} errorMessage={error} />;
}
