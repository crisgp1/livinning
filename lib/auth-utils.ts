import { auth, currentUser } from '@clerk/nextjs/server';

export async function getEffectiveUser() {
  const user = await currentUser();
  return {
    user,
    isImpersonating: false,
    originalUserId: null,
    impersonationData: null
  };
}

export async function getEffectiveUserId() {
  const { user } = await getEffectiveUser();
  return user?.id || null;
}

export async function getEffectiveUserRole() {
  const { user } = await getEffectiveUser();
  return (user?.publicMetadata?.role as string) || 'user';
}