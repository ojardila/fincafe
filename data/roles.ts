export type RoleId = "administrator" | "owner" | "employee";

export interface RoleDefinition {
  id: RoleId;
  translationKey: `roles.${RoleId}`;
  responsibilityKeys: string[];
}

export const roles: RoleDefinition[] = [
  {
    id: "administrator",
    translationKey: "roles.administrator",
    responsibilityKeys: [
      "roles.administrator.responsibilities.userAccess",
      "roles.administrator.responsibilities.reporting",
      "roles.administrator.responsibilities.planning",
    ],
  },
  {
    id: "owner",
    translationKey: "roles.owner",
    responsibilityKeys: [
      "roles.owner.responsibilities.performance",
      "roles.owner.responsibilities.approvals",
      "roles.owner.responsibilities.goals",
    ],
  },
  {
    id: "employee",
    translationKey: "roles.employee",
    responsibilityKeys: [
      "roles.employee.responsibilities.logs",
      "roles.employee.responsibilities.incidents",
      "roles.employee.responsibilities.coordination",
    ],
  },
];
