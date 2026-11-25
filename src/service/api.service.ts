
const API_URL = "http://localhost:3001";

export async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_URL}/${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erro na requisição: ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export async function remover(
  endpoint: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/${endpoint}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao excluir registro.");
  }
}
