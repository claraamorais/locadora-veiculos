
import type { IMarca } from "../models/marca.model";
import { request, remover } from "./api.service";

export async function listarMarcas(): Promise<IMarca[]> {
  return request<IMarca[]>("marcas");
}

export async function buscarMarcaPorId(
  id: string
): Promise<IMarca> {
  return request<IMarca>(`marcas/${id}`);
}

export async function criarMarca(
  marca: IMarca
): Promise<IMarca> {
  return request<IMarca>("marcas", {
    method: "POST",
    body: JSON.stringify({
      nome: marca.nome,
    }),
  });
}

export async function atualizarMarca(
  id: string,
  marca: IMarca
): Promise<IMarca> {
  return request<IMarca>(`marcas/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...marca,
      id,
    }),
  });
}

export async function excluirMarca(
  id: string
): Promise<void> {
  const modelos = await request<
    { id: string; marcaId: string | null }[]
  >("modelos");

  const possuiModelos = modelos.some(
    (modelo) => modelo.marcaId === id
  );

  if (possuiModelos) {
    throw new Error(
      "Não é possível excluir uma marca que possui modelos cadastrados."
    );
  }

  await remover(`marcas/${id}`);
}
