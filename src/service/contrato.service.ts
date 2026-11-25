
import type { IContrato } from "../models/contrato.model";
import { request, remover } from "./api.service";

export async function listarContratos(): Promise<IContrato[]> {
  return request<IContrato[]>("contratos");
}

export async function buscarContratoPorId(
  id: string
): Promise<IContrato> {
  return request<IContrato>(`contratos/${id}`);
}

async function validarContrato(
  contrato: IContrato,
  id?: string
): Promise<void> {
  const contratos = await listarContratos();

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
  await remover(`contratos/${id}`);
}
