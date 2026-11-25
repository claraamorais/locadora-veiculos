
import type {
  INotaFiscal,
} from "../models/notaFiscal.model";

import {
  dataHoje,
} from "../models/locacao.model";

import { request } from "./api.service";

import {
  buscarLocacaoPorId,
} from "./locacao.service";

export async function listarNotasFiscais(): Promise<INotaFiscal[]> {
  return request<INotaFiscal[]>("notasFiscais");
}

export async function buscarNotaFiscalPorId(
  id: string
): Promise<INotaFiscal> {
  return request<INotaFiscal>(
    `notasFiscais/${id}`
  );
}

export async function buscarNotaFiscalPorLocacao(
  locacaoId: string
): Promise<INotaFiscal | undefined> {
  const notas = await listarNotasFiscais();

  return notas.find(
    (item) => item.locacaoId === locacaoId
  );
}

export async function criarNotaFiscal(
  notaFiscal: INotaFiscal
): Promise<INotaFiscal> {
  if (!notaFiscal.locacaoId) {
    throw new Error("Selecione uma locação.");
  }

  const locacao = await buscarLocacaoPorId(
    notaFiscal.locacaoId
  );

  if (locacao.status !== "FINALIZADA") {
    throw new Error(
      "A nota fiscal somente pode ser emitida para locações finalizadas."
    );
  }

  const notas = await listarNotasFiscais();

  const notaExistente = notas.some(
    (item) =>
      item.locacaoId === notaFiscal.locacaoId
  );

  if (notaExistente) {
    throw new Error(
      "Esta locação já possui uma nota fiscal."
    );
  }

  if (
    !Number.isFinite(locacao.valorTotal) ||
    locacao.valorTotal <= 0
  ) {
    throw new Error(
      "O valor da locação é inválido."
    );
  }

  const numero = `NF-${notaFiscal.locacaoId}`;

  const numeroExistente = notas.some(
    (item) => item.numero === numero
  );

  if (numeroExistente) {
    throw new Error(
      "Já existe uma nota fiscal com este número."
    );
  }

  const dados: INotaFiscal = {
    numero,
    serie: "001",
    dataEmissao: dataHoje(),
    valor: Number(
      locacao.valorTotal.toFixed(2)
    ),
    locacaoId: notaFiscal.locacaoId,
  };

  return request<INotaFiscal>(
    "notasFiscais",
    {
      method: "POST",
      body: JSON.stringify(dados),
    }
  );
}

export async function atualizarNotaFiscal(
  id: string,
  _notaFiscal: INotaFiscal
): Promise<INotaFiscal> {
  await buscarNotaFiscalPorId(id);

  throw new Error(
    "Notas fiscais emitidas não podem ser alteradas."
  );
}

export async function excluirNotaFiscal(
  id: string
): Promise<void> {
  await buscarNotaFiscalPorId(id);

  throw new Error(
    "Notas fiscais emitidas não podem ser excluídas."
  );
}
