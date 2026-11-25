
import type { IManutencao } from "../models/manutencao.model";
import { request, remover } from "./api.service";

export async function listarManutencoes(): Promise<IManutencao[]> {
  return request<IManutencao[]>("manutencoes");
}

export async function buscarManutencaoPorId(
  id: string
): Promise<IManutencao> {
  return request<IManutencao>(`manutencoes/${id}`);
}

export async function listarManutencoesPorVeiculo(
  veiculoId: string
): Promise<IManutencao[]> {
  const manutencoes = await listarManutencoes();

  return manutencoes.filter(
    (manutencao) => manutencao.veiculoId === veiculoId
  );
}

async function validarManutencao(
  manutencao: IManutencao,
  id?: string
): Promise<void> {
  if (manutencao.status === "EM_ANDAMENTO") {
    const manutencoes = await listarManutencoes();

    const possuiManutencao = manutencoes.some(
      (item) =>
        item.id !== id &&
        item.veiculoId === manutencao.veiculoId &&
        item.status === "EM_ANDAMENTO"
    );

    if (possuiManutencao) {
      throw new Error(
        "Este veículo já possui uma manutenção em andamento."
      );
    }

    const locacoes = await request<
      { veiculoId: string; status: string }[]
    >("locacoes");

    const possuiLocacao = locacoes.some(
      (locacao) =>
        locacao.veiculoId === manutencao.veiculoId &&
        locacao.status === "ABERTA"
    );

    if (possuiLocacao) {
      throw new Error(
        "Não é possível iniciar uma manutenção em um veículo locado."
      );
    }
  }
}

export async function criarManutencao(
  manutencao: IManutencao
): Promise<IManutencao> {
  await validarManutencao(manutencao);

  return request<IManutencao>("manutencoes", {
    method: "POST",
    body: JSON.stringify(manutencao),
  });
}

export async function atualizarManutencao(
  id: string,
  manutencao: IManutencao
): Promise<IManutencao> {
  await validarManutencao(manutencao, id);

  return request<IManutencao>(`manutencoes/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...manutencao,
      id,
    }),
  });
}

export async function excluirManutencao(
  id: string
): Promise<void> {
  await remover(`manutencoes/${id}`);
}
