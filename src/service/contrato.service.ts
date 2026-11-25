
import type { IContrato } from "../models/contrato.model";
import { request } from "./api.service";

export async function listarContratos(): Promise<IContrato[]> {
  return request<IContrato[]>("contratos");
}

export async function buscarContratoPorId(
  id: string
): Promise<IContrato> {
  return request<IContrato>(`contratos/${id}`);
}

export async function buscarContratoPorLocacao(
  locacaoId: string
): Promise<IContrato | undefined> {
  const contratos = await listarContratos();

  return contratos.find(
    (contrato) => contrato.locacaoId === locacaoId
  );
}

async function validarContrato(
  contrato: IContrato,
  id?: string
): Promise<void> {
  const contratos = await listarContratos();

  const locacoes = await request<
    { id: string }[]
  >("locacoes");

  if (
    !locacoes.some(
      (locacao) => locacao.id === contrato.locacaoId
    )
  ) {
    throw new Error("Locação não encontrada.");
  }

  if (
    contratos.some(
      (item) =>
        item.id !== id &&
        item.locacaoId === contrato.locacaoId
    )
  ) {
    throw new Error(
      "Esta locação já possui um contrato."
    );
  }

  if (
    contratos.some(
      (item) =>
        item.id !== id &&
        item.numero === contrato.numero
    )
  ) {
    throw new Error(
      "Já existe um contrato com esse número."
    );
  }
}

export async function criarContrato(
  contrato: IContrato
): Promise<IContrato> {
  await validarContrato(contrato);

  return request<IContrato>("contratos", {
    method: "POST",
    body: JSON.stringify(contrato),
  });
}

export async function atualizarContrato(
  id: string,
  contrato: IContrato
): Promise<IContrato> {
  const atual = await buscarContratoPorId(id);

  if (atual.locacaoId !== contrato.locacaoId) {
    throw new Error(
      "Não é permitido alterar a locação do contrato."
    );
  }

  await validarContrato(contrato, id);

  return request<IContrato>(`contratos/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...contrato,
      id,
    }),
  });
}

export async function excluirContrato(
  id: string
): Promise<void> {
  await buscarContratoPorId(id);

  throw new Error(
    "O contrato não pode ser excluído individualmente."
  );
}
