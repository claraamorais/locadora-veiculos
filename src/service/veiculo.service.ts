
import type { IVeiculo } from "../models/veiculo.model";
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
      item.placa.toUpperCase() === veiculo.placa.toUpperCase()
  );

  if (placaDuplicada) {
    throw new Error("Já existe um veículo com essa placa.");
  }

  const chassiDuplicado = veiculos.some(
    (item) =>
      item.id !== id &&
      item.chassi.toUpperCase() === veiculo.chassi.toUpperCase()
  );

  if (chassiDuplicado) {
    throw new Error("Já existe um veículo com esse chassi.");
  }
}

export async function criarVeiculo(
  veiculo: IVeiculo
): Promise<IVeiculo> {
  await validarDuplicidade(veiculo);

  return request<IVeiculo>("veiculos", {
    method: "POST",
    body: JSON.stringify({
      chassi: veiculo.chassi,
      placa: veiculo.placa,
      anoFabricacao: veiculo.anoFabricacao,
      cor: veiculo.cor,
      kmRodado: veiculo.kmRodado,
      modeloId: veiculo.modeloId,
    }),
  });
}

export async function atualizarVeiculo(
  id: string,
  veiculo: IVeiculo
): Promise<IVeiculo> {
  await validarDuplicidade(veiculo, id);

  return request<IVeiculo>(`veiculos/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...veiculo,
      id,
    }),
  });
}

export async function excluirVeiculo(
  id: string
): Promise<void> {
  const [manutencoes, locacoes] = await Promise.all([
    request<
      { id: string; veiculoId: string | null }[]
    >("manutencoes"),

    request<
      { id: string; veiculoId: string | null }[]
    >("locacoes"),
  ]);

  const possuiManutencoes = manutencoes.some(
    (manutencao) => manutencao.veiculoId === id
  );

  const possuiLocacoes = locacoes.some(
    (locacao) => locacao.veiculoId === id
  );

  if (possuiManutencoes) {
    throw new Error(
      "Não é possível excluir um veículo que possui manutenções cadastradas."
    );
  }

  if (possuiLocacoes) {
    throw new Error(
      "Não é possível excluir um veículo que possui locações cadastradas."
    );
  }

  await remover(`veiculos/${id}`);
}
