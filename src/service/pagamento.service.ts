
import type {
  IPagamento,
} from "../models/pagamento.model";

import {
  calcularTotalPago,
} from "../models/pagamento.model";

import {
  dataHoje,
} from "../models/locacao.model";

import { request, remover } from "./api.service";

import {
  buscarLocacaoPorId,
} from "./locacao.service";

export async function listarPagamentos(): Promise<IPagamento[]> {
  return request<IPagamento[]>("pagamentos");
}

export async function buscarPagamentoPorId(
  id: string
): Promise<IPagamento> {
  return request<IPagamento>(`pagamentos/${id}`);
}

export async function listarPagamentosPorLocacao(
  locacaoId: string
): Promise<IPagamento[]> {
  const pagamentos = await listarPagamentos();

  return pagamentos.filter(
    (item) => item.locacaoId === locacaoId
  );
}

async function validarPagamento(
  pagamento: IPagamento,
  id?: string
): Promise<void> {
  if (!pagamento.locacaoId) {
    throw new Error("Selecione uma locação.");
  }

  if (
    !pagamento.data ||
    !Number.isFinite(Date.parse(pagamento.data))
  ) {
    throw new Error("Informe uma data válida.");
  }

  if (
    pagamento.status === "CONFIRMADO" &&
    pagamento.data.slice(0, 10) > dataHoje()
  ) {
    throw new Error(
      "Um pagamento confirmado não pode ter data futura."
    );
  }

  if (
    !Number.isFinite(pagamento.valor) ||
    pagamento.valor <= 0
  ) {
    throw new Error(
      "O valor do pagamento deve ser maior que zero."
    );
  }

  if (
    ![
      "PIX",
      "DINHEIRO",
      "CARTAO_CREDITO",
      "CARTAO_DEBITO",
      "TRANSFERENCIA",
    ].includes(pagamento.forma)
  ) {
    throw new Error(
      "Forma de pagamento inválida."
    );
  }

  if (
    ![
      "PENDENTE",
      "CONFIRMADO",
      "CANCELADO",
    ].includes(pagamento.status)
  ) {
    throw new Error(
      "Status de pagamento inválido."
    );
  }

  const locacao = await buscarLocacaoPorId(
    pagamento.locacaoId
  );

  if (locacao.status === "CANCELADA") {
    throw new Error(
      "Não é permitido registrar pagamentos em locações canceladas."
    );
  }

  const pagamentos =
    await listarPagamentosPorLocacao(
      pagamento.locacaoId
    );

  const outrosPagamentos = pagamentos.filter(
    (item) => item.id !== id
  );

  const totalPago = calcularTotalPago(
    outrosPagamentos
  );

  const saldo = Number(
    (locacao.valorTotal - totalPago).toFixed(2)
  );

  if (
    pagamento.status === "CONFIRMADO" &&
    Math.round(pagamento.valor * 100) >
      Math.round(saldo * 100)
  ) {
    throw new Error(
      `O pagamento excede o saldo restante de ${saldo.toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL",
        }
      )}.`
    );
  }
}

export async function criarPagamento(
  pagamento: IPagamento
): Promise<IPagamento> {
  if (pagamento.status === "CANCELADO") {
    throw new Error(
      "Um novo pagamento não pode ser cadastrado como cancelado."
    );
  }

  const dados = {
    ...pagamento,
    valor: Number(pagamento.valor.toFixed(2)),
  };

  await validarPagamento(dados);

  return request<IPagamento>(
    "pagamentos",
    {
      method: "POST",
      body: JSON.stringify(dados),
    }
  );
}

export async function atualizarPagamento(
  id: string,
  pagamento: IPagamento
): Promise<IPagamento> {
  const atual = await buscarPagamentoPorId(id);

  if (atual.status === "CANCELADO") {
    throw new Error(
      "Pagamentos cancelados não podem ser alterados."
    );
  }

  if (atual.status === "CONFIRMADO") {
    throw new Error(
      "Pagamentos confirmados não podem ser editados."
    );
  }

  if (atual.locacaoId !== pagamento.locacaoId) {
    throw new Error(
      "Não é permitido alterar a locação do pagamento."
    );
  }

  const dados = {
    ...pagamento,
    id,
    valor: Number(pagamento.valor.toFixed(2)),
  };

  await validarPagamento(dados, id);

  return request<IPagamento>(
    `pagamentos/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(dados),
    }
  );
}

export async function confirmarPagamento(
  id: string
): Promise<IPagamento> {
  const pagamento =
    await buscarPagamentoPorId(id);

  if (pagamento.status !== "PENDENTE") {
    throw new Error(
      "Somente pagamentos pendentes podem ser confirmados."
    );
  }

  return atualizarPagamento(id, {
    ...pagamento,
    data: dataHoje(),
    status: "CONFIRMADO",
  });
}

export async function cancelarPagamento(
  id: string
): Promise<IPagamento> {
  const pagamento =
    await buscarPagamentoPorId(id);

  if (pagamento.status !== "PENDENTE") {
    throw new Error(
      "Somente pagamentos pendentes podem ser cancelados."
    );
  }

  return atualizarPagamento(id, {
    ...pagamento,
    status: "CANCELADO",
  });
}

export async function excluirPagamento(
  id: string
): Promise<void> {
  const pagamento =
    await buscarPagamentoPorId(id);

  if (pagamento.status === "CONFIRMADO") {
    throw new Error(
      "Pagamentos confirmados não podem ser excluídos."
    );
  }

  await remover(`pagamentos/${id}`);
}
