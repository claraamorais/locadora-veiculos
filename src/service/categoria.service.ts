
import type { ICategoria } from "../models/categoria.model";
import { request, remover } from "./api.service";

export async function listarCategorias(): Promise<ICategoria[]> {
  return request<ICategoria[]>("categorias");
}

export async function buscarCategoriaPorId(
  id: string
): Promise<ICategoria> {
  return request<ICategoria>(`categorias/${id}`);
}

export async function criarCategoria(
  categoria: ICategoria
): Promise<ICategoria> {
  return request<ICategoria>("categorias", {
    method: "POST",
    body: JSON.stringify({
      nome: categoria.nome,
      valorLocacao: categoria.valorLocacao,
    }),
  });
}

export async function atualizarCategoria(
  id: string,
  categoria: ICategoria
): Promise<ICategoria> {
  return request<ICategoria>(`categorias/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...categoria,
      id,
    }),
  });
}

export async function excluirCategoria(
  id: string
): Promise<void> {
  const modelos = await request<
    { id: string; categoriaId: string | null }[]
  >("modelos");

  const possuiModelos = modelos.some(
    (modelo) => modelo.categoriaId === id
  );

  if (possuiModelos) {
    throw new Error(
      "Não é possível excluir uma categoria que possui modelos cadastrados."
    );
  }

  await remover(`categorias/${id}`);
}
