import { notFound } from 'next/navigation';
import UserForm from '../UserForm';

async function getUser(id: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  return <UserForm user={user} />;
}
