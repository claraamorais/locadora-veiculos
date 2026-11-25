
import type { ILocacao } from "../models/locacao.model";
import type { IVeiculo } from "../models/veiculo.model";

import {
  calcularValorLocacao,
  dataHoje,
} from "../models/locacao.model";

import { request, remover } from "./api.service";

import { buscarClientePorId } from "./cliente.service";

import {
  buscarVeiculoPorId,
  listarVeiculos,
} from "./veiculo.service";

import { buscarModeloPorId } from "./modelo.service";
import { buscarCategoriaPorId } from "./categoria.service";
import { listarManutencoes } from "./manutencao.service";
import { criarContrato } from "./contrato.service";

export async function listarLocacoes(): Promise<ILocacao[]> {
  return request<ILocacao[]>("locacoes");
}

export async function buscarLocacaoPorId(
  id: string
): Promise<ILocacao> {
  return request<ILocacao>(`locacoes/${id}`);
}

export async function listarVeiculosDisponiveis(
  locacaoId?: string
): Promise<IVeiculo[]> {
  const [veiculos, locacoes, manutencoes] =
    await Promise.all([
      listarVeiculos(),
      listarLocacoes(),
      listarManutencoes(),
    ]);

  return veiculos.filter((veiculo) => {
    const estaLocado = locacoes.some(
      (locacao) =>
        locacao.veiculoId === veiculo.id &&
        locacao.status === "ABERTA" &&
        locacao.id !== locacaoId
    );

    const estaEmManutencao = manutencoes.some(
      (manutencao) =>
        manutencao.veiculoId === veiculo.id &&
        manutencao.status === "EM_ANDAMENTO"
    );

    return !estaLocado && !estaEmManutencao;
  });
}

async function prepararLocacao(
  locacao: ILocacao,
  id?: string
): Promise<ILocacao> {
  if (!locacao.clienteId) {
    throw new Error("Selecione um cliente.");
  }

  if (!locacao.veiculoId) {
    throw new Error("Selecione um veículo.");
  }

  if (
    !locacao.dataRetirada ||
    !locacao.dataDevolucaoPrevista
  ) {
    throw new Error(
      "Informe as datas de retirada e devolução."
    );
  }

  if (
    !Number.isFinite(Date.parse(locacao.dataRetirada)) ||
    !Number.isFinite(
      Date.parse(locacao.dataDevolucaoPrevista)
    )
  ) {
    throw new Error("Informe datas válidas.");
  }

  if (
    locacao.dataDevolucaoPrevista <=
    locacao.dataRetirada
  ) {
    throw new Error(
      "A data de devolução prevista deve ser posterior à data de retirada."
    );
  }

  const cliente = await buscarClientePorId(
    locacao.clienteId
  );

  if (
    cliente.validadeCnh < dataHoje() ||
    cliente.validadeCnh < locacao.dataRetirada
  ) {
    throw new Error(
      "Não é permitido registrar uma locação para um cliente com CNH vencida."
    );
  }

  const veiculo = await buscarVeiculoPorId(
    locacao.veiculoId
  );

  const locacoes = await listarLocacoes();

  const veiculoLocado = locacoes.some(
    (item) =>
      item.id !== id &&
      item.veiculoId === locacao.veiculoId &&
      item.status === "ABERTA"
  );

  if (veiculoLocado) {
    throw new Error(
      "Este veículo já possui uma locação aberta."
    );
  }

  const manutencoes = await listarManutencoes();

  const veiculoEmManutencao = manutencoes.some(
    (item) =>
      item.veiculoId === locacao.veiculoId &&
      item.status === "EM_ANDAMENTO"
  );

  if (veiculoEmManutencao) {
    throw new Error(
      "Este veículo está em manutenção."
    );
  }

  const modelo = await buscarModeloPorId(
    veiculo.modeloId
  );

  const categoria = await buscarCategoriaPorId(
    modelo.categoriaId
  );

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

  return {
    ...locacao,
    kmRetirada: veiculo.kmRodado,
    valorTotal: Number(valorTotal.toFixed(2)),
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
        "O cliente compromete-se a devolver o veículo " +
        "nas condições e no prazo estabelecidos na locação. " +
        "O valor final será calculado de acordo com o " +
        "período efetivamente utilizado. As condições " +
        "do veículo serão registradas nas vistorias " +
        "de retirada e devolução.",
      locacaoId: novaLocacao.id,
    });
  } catch {
    const contratos = await request<
      { id: string; locacaoId: string }[]
    >("contratos");

    const contratoExistente = contratos.some(
      (item) =>
        item.locacaoId === novaLocacao.id
    );

    if (contratoExistente) {
      return novaLocacao;
    }

    await remover(`locacoes/${novaLocacao.id}`);

    throw new Error(
      "Não foi possível gerar o contrato. " +
      "O cadastro da locação foi desfeito."
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

  const vistorias = await request<
    { locacaoId: string }[]
  >("vistorias");

  const possuiVistoria = vistorias.some(
    (item) => item.locacaoId === id
  );

  if (possuiVistoria) {
    throw new Error(
      "Não é possível editar uma locação " +
      "que já possui vistoria registrada."
    );
  }

  if (
    atual.clienteId !== locacao.clienteId ||
    atual.veiculoId !== locacao.veiculoId
  ) {
    throw new Error(
      "Não é permitido trocar o cliente ou " +
      "veículo de uma locação registrada."
    );
  }

  const dados = await prepararLocacao(
    locacao,
    id
  );

  return request<ILocacao>(
    `locacoes/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        ...dados,
        id,
        kmRetirada: atual.kmRetirada,
      }),
    }
  );
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

  const [vistorias, pagamentos, notasFiscais] =
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
    vistorias.some(
      (item) => item.locacaoId === id
    )
  ) {
    throw new Error(
      "Não é possível cancelar uma locação " +
      "que possui vistoria registrada."
    );
  }

  if (
    pagamentos.some(
      (item) => item.locacaoId === id
    )
  ) {
    throw new Error(
      "Não é possível cancelar uma locação " +
      "que possui pagamentos registrados."
    );
  }

  if (
    notasFiscais.some(
      (item) => item.locacaoId === id
    )
  ) {
    throw new Error(
      "Não é possível cancelar uma locação " +
      "que possui nota fiscal."
    );
  }

  return request<ILocacao>(
    `locacoes/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "CANCELADA",
      }),
    }
  );
}

export async function excluirLocacao(
  id: string
): Promise<void> {
  const locacao = await buscarLocacaoPorId(id);

  if (locacao.status !== "CANCELADA") {
    throw new Error(
      "Somente locações canceladas podem ser excluídas."
    );
  }

  const [
    contratos,
    vistorias,
    pagamentos,
    notasFiscais,
  ] = await Promise.all([
    request<{ locacaoId: string }[]>(
      "contratos"
    ),
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
    contratos.some(
      (item) => item.locacaoId === id
    )
  ) {
    throw new Error(
      "Não é possível excluir uma locação " +
      "que possui contrato vinculado."
    );
  }

  if (
    vistorias.some(
      (item) => item.locacaoId === id
    )
  ) {
    throw new Error(
      "Não é possível excluir uma locação " +
      "que possui vistorias registradas."
    );
  }

  if (
    pagamentos.some(
      (item) => item.locacaoId === id
    )
  ) {
    throw new Error(
      "Não é possível excluir uma locação " +
      "que possui pagamentos registrados."
    );
  }

  if (
    notasFiscais.some(
      (item) => item.locacaoId === id
    )
  ) {
    throw new Error(
      "Não é possível excluir uma locação " +
      "que possui nota fiscal."
    );
  }

  await remover(`locacoes/${id}`);
}
