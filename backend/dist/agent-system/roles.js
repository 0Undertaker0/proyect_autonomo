export const AGENT_ROLES = [
    {
        code: 'admin',
        label: 'Administrador',
        permissions: ['read:all', 'manage:tasks', 'manage:memory', 'manage:roles'],
    },
    {
        code: 'director',
        label: 'AI Director',
        permissions: ['read:all', 'manage:tasks', 'approve:strategy'],
    },
    {
        code: 'analyst',
        label: 'Analista',
        permissions: ['read:all', 'write:research', 'read:metrics'],
    },
    {
        code: 'publisher',
        label: 'Publicador',
        permissions: ['read:tasks', 'publish:content'],
    },
];
//# sourceMappingURL=roles.js.map