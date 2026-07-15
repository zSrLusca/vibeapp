export const ROLES = {
  user: {
    label: "Usuário",
    description: "Pode ler posts e interagir na plataforma.",
  },
  moderator: {
    label: "Moderador",
    description: "Pode criar e apagar posts.",
  },
  admin: {
    label: "Admin",
    description: "Pode criar, editar e apagar posts.",
  },
  superadmin: {
    label: "Super Admin",
    description: "Acesso total, incluindo gestão de usuários e papéis.",
  },
};

export const PERMISSIONS = {
  create_post: "Criar posts",
  delete_post: "Apagar posts",
  edit_post: "Editar posts",
  manage_users: "Gerenciar usuários",
  manage_roles: "Definir papéis",
};

export const ROLE_PERMISSIONS = {
  user: [],
  moderator: ["create_post", "delete_post"],
  admin: ["create_post", "delete_post", "edit_post"],
  superadmin: [
    "create_post",
    "delete_post",
    "edit_post",
    "manage_users",
    "manage_roles",
  ],
};

export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccessAdmin(role) {
  return (
    hasPermission(role, "create_post") ||
    hasPermission(role, "manage_users") ||
    hasPermission(role, "manage_roles")
  );
}
