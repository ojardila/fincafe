import { notFound } from 'next/navigation';
import RoleForm from '../RoleForm';

async function getRole(id: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/roles/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching role:', error);
    return null;
  }
}

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getRole(id);

  if (!role) {
    notFound();
  }

  return <RoleForm role={role} />;
}
