export type UserProfile = 'ADMIN' | 'GERENTE' | 'FUNCIONARIO';

const managerEntities = [
  'clientes',
  'funcionarios',
  'canaisContato',
  'categoriasContrato',
  'servicos',
  'contratos',
  'itensContrato',
  'pagamentos',
  'documentos',
  'notificacoes',
];

const employeeEntities = [
  'contratos',
  'itensContrato',
  'pagamentos',
  'documentos',
  'notificacoes',
];

export const getVisibleEntityKeys = (profile: UserProfile | null, allKeys: string[]) => {
  if (profile === 'ADMIN') return allKeys;
  if (profile === 'GERENTE') return managerEntities;
  if (profile === 'FUNCIONARIO') return employeeEntities;
  return [];
};

export const canManageEntity = (profile: UserProfile | null, entityKey: string) => {
  if (['auditorias', 'notificacoes'].includes(entityKey)) return false;
  if (profile === 'ADMIN') return true;
  return profile === 'GERENTE' && managerEntities.includes(entityKey) && entityKey !== 'usuarios';
};

export const canDeleteEntity = (profile: UserProfile | null, entityKey: string) => {
  if (entityKey === 'auditorias') return false;
  if (entityKey === 'notificacoes') return profile === 'ADMIN' || profile === 'GERENTE';
  return canManageEntity(profile, entityKey);
};
