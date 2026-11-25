
import type {
  IVeiculo,
  IVeiculoComStatus,
  StatusVeiculo,
} from "../models/veiculo.model";

import type {
  ILocacao,
} from "../models/locacao.model";

import type {
  IManutencao,
} from "../models/manutencao.model";

import { request, remover } from "./api.service";

export async function listarVeiculos(): Promise<IVeiculo[]> {
  return request<IVeiculo[]>("veiculos");
}

export async function buscarVeiculoPorId(
  id: string
): Promise<IVeiculo> {
  return request<IVeiculo>(`veiculos/${id}`);
}

async function validarDuplicidade(
  veiculo: IVeiculo,
  id?: string
): Promise<void> {
  const veiculos = await listarVeiculos();

  const placaDuplicada = veiculos.some(
    (item) =>
      item.id !== id &&
      item.placa.toUpperCase() ===
        veiculo.placa.toUpperCase()
  );

  if (placaDuplicada) {
    throw new Error(
      "Já existe um veículo cadastrado com esta placa."
    );
  }

  const chassiDuplicado = veiculos.some(
    (item) =>
      item.id !== id &&
      item.chassi.toUpperCase() ===
        veiculo.chassi.toUpperCase()
  );

  if (chassiDuplicado) {
    throw new Error(
      "Já existe um veículo cadastrado com este chassi."
    );
  }
}

export async function criarVeiculo(
  veiculo: IVeiculo
): Promise<IVeiculo> {
  await validarDuplicidade(veiculo);

  return request<IVeiculo>("veiculos", {
    method: "POST",
    body: JSON.stringify(veiculo),
  });
}

export async function atualizarVeiculo(
  id: string,
  veiculo: IVeiculo
): Promise<IVeiculo> {
  await validarDuplicidade(veiculo, id);

  return request<IVeiculo>(
    `veiculos/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        ...veiculo,
        id,
      }),
    }
  );
}

export async function excluirVeiculo(
  id: string
): Promise<void> {
  const [manutencoes, locacoes] =
    await Promise.all([
      request<IManutencao[]>("manutencoes"),
      request<ILocacao[]>("locacoes"),
    ]);

  const possuiManutencao = manutencoes.some(
    (item) => item.veiculoId === id
  );

  if (possuiManutencao) {
    throw new Error(
      "Não é possível excluir um veículo que possui manutenções vinculadas."
    );
  }

  const possuiLocacao = locacoes.some(
    (item) => item.veiculoId === id
  );

  if (possuiLocacao) {
    throw new Error(
      "Não é possível excluir um veículo que possui locações vinculadas."
    );
  }

  await remover(`veiculos/${id}`);
}

export function calcularStatusVeiculo(
  veiculo: IVeiculo,
  locacoes: ILocacao[],
  manutencoes: IManutencao[]
): StatusVeiculo {
  const emManutencao = manutencoes.some(
    (item) =>
      item.veiculoId === veiculo.id &&
      item.status === "EM_ANDAMENTO"
  );

  if (emManutencao) {
    return "EM_MANUTENCAO";
  }

  const locado = locacoes.some(
    (item) =>
      item.veiculoId === veiculo.id &&
      item.status === "ABERTA"
  );

  if (locado) {
    return "LOCADO";
  }

  return "DISPONIVEL";
}

export async function listarVeiculosComStatus(): Promise<IVeiculoComStatus[]> {
  const [veiculos, locacoes, manutencoes] =
    await Promise.all([
      listarVeiculos(),
      request<ILocacao[]>("locacoes"),
      request<IManutencao[]>("manutencoes"),
    ]);

  return veiculos.map((veiculo) => ({
    ...veiculo,
    status: calcularStatusVeiculo(
      veiculo,
      locacoes,
      manutencoes
    ),
  }));
}
