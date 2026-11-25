
import type { IModelo } from "../models/modelo.model";
import { request, remover } from "./api.service";

export async function listarModelos(): Promise<IModelo[]> {
  return request<IModelo[]>("modelos");
}

export async function buscarModeloPorId(
  id: string
): Promise<IModelo> {
  return request<IModelo>(`modelos/${id}`);
}

export async function criarModelo(
  modelo: IModelo
): Promise<IModelo> {
  return request<IModelo>("modelos", {
    method: "POST",
    body: JSON.stringify({
      nome: modelo.nome,
      ano: modelo.ano,
      marcaId: modelo.marcaId,
      categoriaId: modelo.categoriaId,
    }),
  });
}

export async function atualizarModelo(
  id: string,
  modelo: IModelo
): Promise<IModelo> {
  return request<IModelo>(`modelos/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...modelo,
      id,
    }),
  });
}

export async function excluirModelo(
  id: string
): Promise<void> {
  const veiculos = await request<
    { id: string; modeloId: string | null }[]
  >("veiculos");

  const possuiVeiculos = veiculos.some(
    (veiculo) => veiculo.modeloId === id
  );

  if (possuiVeiculos) {
    throw new Error(
      "Não é possível excluir um modelo que possui veículos cadastrados."
    );
  }

  await remover(`modelos/${id}`);
}
