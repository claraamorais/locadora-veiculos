
import type {
  ILocacao,
} from "../models/locacao.model";

import {
  calcularValorLocacao,
  dataHoje,
} from "../models/locacao.model";

import { request, remover } from "./api.service";

import {
  buscarClientePorId,
} from "./cliente.service";

import {
  buscarVeiculoPorId,
  listarVeiculos,
} from "./veiculo.service";

import {
  listarModelos,
} from "./modelo.service";

import {
  listarCategorias,
} from "./categoria.service";

import {
  listarManutencoes,
} from "./manutencao.service";

import {
  criarContrato,
  listarContratos,
} from "./contrato.service";

import type {
  IVeiculo,
} from "../models/veiculo.model";

export async function listarLocacoes(): Promise<ILocacao[]> {
  return request<ILocacao[]>("locacoes");
}

export async function buscarLocacaoPorId(
  id: string
): Promise<ILocacao> {
  return request<ILocacao>(`locacoes/${id}`);
}

export async function listarVeiculosDisponiveis(): Promise<IVeiculo[]> {
  const [
    veiculos,
    locacoes,
    manutencoes,
  ] = await Promise.all([
    listarVeiculos(),
    listarLocacoes(),
    listarManutencoes(),
  ]);

  return veiculos.filter((veiculo) => {
    const locado = locacoes.some(
      (locacao) =>
        locacao.veiculoId === veiculo.id &&
        locacao.status === "ABERTA"
    );

    const emManutencao = manutencoes.some(
      (manutencao) =>
        manutencao.veiculoId === veiculo.id &&
        manutencao.status === "EM_ANDAMENTO"
    );

    return !locado && !emManutencao;
  });
}

async function prepararLocacao(
  locacao: ILocacao,
  id?: string
): Promise<ILocacao> {
  if (
    !locacao.dataRetirada ||
    !locacao.dataDevolucaoPrevista ||
    locacao.dataDevolucaoPrevista <=
      locacao.dataRetirada
  ) {
    throw new Error(
      "A devolução prevista deve ser posterior à retirada."
    );
  }

  const [
    cliente,
    veiculo,
    locacoes,
    manutencoes,
    modelos,
    categorias,
  ] = await Promise.all([
    buscarClientePorId(locacao.clienteId),
    buscarVeiculoPorId(locacao.veiculoId),
    listarLocacoes(),
    listarManutencoes(),
    listarModelos(),
    listarCategorias(),
  ]);

  if (
    !cliente.validadeCnh ||
    cliente.validadeCnh < dataHoje() ||
    cliente.validadeCnh < locacao.dataRetirada
  ) {
    throw new Error(
      "O cliente está com a CNH vencida ou estará na data da retirada."
    );
  }

  const veiculoLocado = locacoes.some(
    (item) =>
      item.id !== id &&
      item.veiculoId === locacao.veiculoId &&
      item.status === "ABERTA"
  );

  if (veiculoLocado) {
    throw new Error(
      "O veículo já possui uma locação aberta."
    );
  }

  const emManutencao = manutencoes.some(
    (item) =>
      item.veiculoId === locacao.veiculoId &&
      item.status === "EM_ANDAMENTO"
  );

  if (emManutencao) {
    throw new Error(
      "O veículo está em manutenção."
    );
  }

  const modelo = modelos.find(
    (item) => item.id === veiculo.modeloId
  );

  if (!modelo) {
    throw new Error(
      "Modelo do veículo não encontrado."
    );
  }

  const categoria = categorias.find(
    (item) => item.id === modelo.categoriaId
  );

  if (!categoria) {
    throw new Error(
      "Categoria do veículo não encontrada."
    );
  }

  if (
    !Number.isFinite(categoria.valorLocacao) ||
    categoria.valorLocacao <= 0
  ) {
    throw new Error(
      "O valor da diária da categoria é inválido."
    );
  }

  const valorTotal = calcularValorLocacao(
    locacao.dataRetirada,
    locacao.dataDevolucaoPrevista,
    categoria.valorLocacao
  );

  if (valorTotal <= 0) {
    throw new Error(
      "O valor calculado da locação é inválido."
    );
  }

  return {
    ...locacao,
    kmRetirada: veiculo.kmRodado,
    valorTotal,
    status: "ABERTA",
  };
}

export async function criarLocacao(
  locacao: ILocacao
): Promise<ILocacao> {
  const dados = await prepararLocacao(locacao);

  const novaLocacao = await request<ILocacao>(
    "locacoes",
    {
      method: "POST",
      body: JSON.stringify(dados),
    }
  );

  if (!novaLocacao.id) {
    throw new Error(
      "Não foi possível identificar a locação criada."
    );
  }

  try {
    await criarContrato({
      numero: `CTR-${novaLocacao.id}`,
      dataEmissao: dataHoje(),
      termos:
        "O cliente compromete-se a devolver o veículo nas condições e no prazo estabelecidos na locação.",
      locacaoId: novaLocacao.id,
    });
  } catch {
    try {
      const contratos = await listarContratos();

      const contratoCriado = contratos.some(
        (item) =>
          item.locacaoId === novaLocacao.id
      );

      if (!contratoCriado) {
        await remover(
          `locacoes/${novaLocacao.id}`
        );
      } else {
        return novaLocacao;
      }
    } catch {
      throw new Error(
        "Falha ao gerar o contrato. Confira os registros antes de tentar novamente."
      );
    }

    throw new Error(
      "Não foi possível gerar o contrato. A locação foi desfeita."
    );
  }

  return novaLocacao;
}

export async function atualizarLocacao(
  id: string,
  locacao: ILocacao
): Promise<ILocacao> {
  const atual = await buscarLocacaoPorId(id);

  if (atual.status !== "ABERTA") {
    throw new Error(
      "Somente locações abertas podem ser alteradas."
    );
  }

  if (
    atual.clienteId !== locacao.clienteId ||
    atual.veiculoId !== locacao.veiculoId
  ) {
    throw new Error(
      "Não é permitido trocar o cliente ou veículo de uma locação registrada."
    );
  }

  const dados = await prepararLocacao(
    locacao,
    id
  );

  return request<ILocacao>(`locacoes/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...dados,
      id,
      kmRetirada: atual.kmRetirada,
    }),
  });
}

export async function cancelarLocacao(
  id: string
): Promise<ILocacao> {
  const locacao = await buscarLocacaoPorId(id);

  if (locacao.status !== "ABERTA") {
    throw new Error(
      "Somente locações abertas podem ser canceladas."
    );
  }

  const [vistorias, pagamentos, notas] =
    await Promise.all([
      request<{ locacaoId: string }[]>(
        "vistorias"
      ),
      request<{ locacaoId: string }[]>(
        "pagamentos"
      ),
      request<{ locacaoId: string }[]>(
        "notasFiscais"
      ),
    ]);

  if (
    [...vistorias, ...pagamentos, ...notas].some(
      (item) => item.locacaoId === id
    )
  ) {
    throw new Error(
      "A locação possui movimentações e não pode ser cancelada por esta operação."
    );
  }

  return request<ILocacao>(`locacoes/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "CANCELADA",
    }),
  });
}

export async function excluirLocacao(
  id: string
): Promise<void> {
  const [
    contratos,
    vistorias,
    pagamentos,
    notas,
  ] = await Promise.all([
    listarContratos(),
    request<{ locacaoId: string }[]>(
      "vistorias"
    ),
    request<{ locacaoId: string }[]>(
      "pagamentos"
    ),
    request<{ locacaoId: string }[]>(
      "notasFiscais"
    ),
  ]);

  const possuiDependentes = [
    ...contratos,
    ...vistorias,
    ...pagamentos,
    ...notas,
  ].some(
    (item) => item.locacaoId === id
  );

  if (possuiDependentes) {
    throw new Error(
      "Não é possível excluir uma locação que possui registros vinculados."
    );
  }

  await remover(`locacoes/${id}`);
}
