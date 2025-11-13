import FarmRoleForm from '../FarmRoleForm';

export default function NewFarmRolePage({
  params,
}: {
  params: { farmCode: string };
}) {
  return <FarmRoleForm farmCode={params.farmCode} />;
}
