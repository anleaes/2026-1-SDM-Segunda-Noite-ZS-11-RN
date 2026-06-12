import { buildUrl } from '../constants/api';
import { UserProfile } from '../constants/access';

export type AuthSession = {
  authenticated: boolean;
  username: string;
  profile: UserProfile | null;
  employee_id: number | null;
};

const readErrorMessage = async (response: Response, fallback: string) => {
  const errorText = await response.text();

  if (!errorText) return fallback;

  try {
    const parsed = JSON.parse(errorText);
    if (parsed.detail) return String(parsed.detail);
    if (parsed.non_field_errors?.length) return String(parsed.non_field_errors[0]);
    return JSON.stringify(parsed);
  } catch {
    return errorText;
  }
};

export async function apiLogin(username: string, password: string): Promise<AuthSession> {
  const response = await fetch(buildUrl('/token-autenticacao/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Usuario ou senha invalidos.'));
  }

  return response.json();
}

export async function apiAuthStatus(): Promise<AuthSession | null> {
  const response = await fetch(buildUrl('/auth/status/'), {
    credentials: 'include',
  });

  if (!response.ok) return null;
  return response.json();
}

export async function apiLogout() {
  const response = await fetch(buildUrl('/auth/logout/'), {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Erro ao sair do sistema.'));
  }
}

export async function apiList(endpoint: string) {
  const response = await fetch(buildUrl(endpoint), {
    credentials: 'include',
  });
  if (!response.ok) throw new Error(`Erro ao listar registros (${response.status}). Tente novamente.`);
  return response.json();
}

export async function apiCreate(endpoint: string, payload: any) {
  const response = await fetch(buildUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Erro ao criar: ${response.status}`));
  }
  return response.json();
}

export async function apiUpdate(endpoint: string, id: number, payload: any) {
  const response = await fetch(buildUrl(endpoint, id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Erro ao atualizar: ${response.status}`));
  }
  return response.json();
}

export async function apiDelete(endpoint: string, id: number | string) {
  const response = await fetch(buildUrl(endpoint, id), {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error(`Erro ao excluir: ${response.status}`);
}

export async function apiPostAction(endpoint: string, id: number | string, action: string) {
  const response = await fetch(`${buildUrl(endpoint, id)}${action}/`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Erro ao executar acao: ${response.status}`));
  }

  return response.json();
}
