import FarmUserForm from '../FarmUserForm';

export default function NewFarmUserPage({
  params,
}: {
  params: { farmCode: string };
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New User</h1>
      <FarmUserForm farmCode={params.farmCode} />
    </div>
  );
}
