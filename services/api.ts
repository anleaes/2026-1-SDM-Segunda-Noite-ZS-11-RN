import { buildUrl } from '../constants/api';

export async function apiList(endpoint: string) {
  const response = await fetch(buildUrl(endpoint));
  if (!response.ok) throw new Error(`Erro ao listar: ${response.status}`);
  return response.json();
}

export async function apiCreate(endpoint: string, payload: any) {
  const response = await fetch(buildUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erro ao criar: ${response.status}`);
  }
  return response.json();
}

export async function apiUpdate(endpoint: string, id: number, payload: any) {
  const response = await fetch(buildUrl(endpoint, id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erro ao atualizar: ${response.status}`);
  }
  return response.json();
}

export async function apiDelete(endpoint: string, id: number) {
  const response = await fetch(buildUrl(endpoint, id), { method: 'DELETE' });
  if (!response.ok) throw new Error(`Erro ao excluir: ${response.status}`);
}
