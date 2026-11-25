
import type {
  IVistoria,
} from "../models/vistoria.model";

import type {
  ILocacao,
} from "../models/locacao.model";

import type {
  IVeiculo,
} from "../models/veiculo.model";

import {
  calcularDiarias,
} from "../models/locacao.model";

import { request, remover } from "./api.service";

import {
  buscarLocacaoPorId,
} from "./locacao.service";

import {
  buscarVeiculoPorId,
} from "./veiculo.service";

export async function listarVistorias(): Promise<IVistoria[]> {
  return request<IVistoria[]>("vistorias");
}

export async function buscarVistoriaPorId(
  id: string
): Promise<IVistoria> {
  return request<IVistoria>(`vistorias/${id}`);
}

export async function listarVistoriasPorLocacao(
  locacaoId: string
): Promise<IVistoria[]> {
  const vistorias = await listarVistorias();

  return vistorias.filter(
    (item) => item.locacaoId === locacaoId
  );
}

function validarCampos(vistoria: IVistoria): void {
  if (!vistoria.locacaoId) {
    throw new Error("Selecione uma locação.");
  }

  if (
    !vistoria.data ||
    !Number.isFinite(Date.parse(vistoria.data))
  ) {
    throw new Error("Informe uma data válida.");
  }

  if (
    !Number.isInteger(vistoria.km) ||
    vistoria.km < 0
  ) {
    throw new Error("Quilometragem inválida.");
  }

  if (
    !["RETIRADA", "DEVOLUCAO"].includes(
      vistoria.tipo
    )
  ) {
    throw new Error("Tipo de vistoria inválido.");
  }

  if (
    !["VAZIO", "1/4", "1/2", "3/4", "CHEIO"]
      .includes(vistoria.nivelCombustivel)
  ) {
    throw new Error(
      "Nível de combustível inválido."
    );
  }
}

export async function criarVistoria(
  vistoria: IVistoria
): Promise<IVistoria> {
  validarCampos(vistoria);

  const locacao = await buscarLocacaoPorId(
    vistoria.locacaoId
  );

  if (locacao.status !== "ABERTA") {
    throw new Error(
      "Somente locações abertas podem receber vistorias."
    );
  }

  const veiculo = await buscarVeiculoPorId(
    locacao.veiculoId
  );

  const vistorias =
    await listarVistoriasPorLocacao(
      vistoria.locacaoId
    );

  const retirada = vistorias.find(
    (item) => item.tipo === "RETIRADA"
  );

  const devolucao = vistorias.find(
    (item) => item.tipo === "DEVOLUCAO"
  );

  if (devolucao) {
    throw new Error(
      "Esta locação já possui vistoria de devolução."
    );
  }

  const dataVistoria = vistoria.data.slice(0, 10);

  if (vistoria.tipo === "RETIRADA") {
    if (retirada) {
      throw new Error(
        "Esta locação já possui vistoria de retirada."
      );
    }

    if (dataVistoria !== locacao.dataRetirada) {
      throw new Error(
        "A vistoria deve ocorrer na data de retirada da locação."
      );
    }

    if (
      vistoria.km < veiculo.kmRodado ||
      vistoria.km < locacao.kmRetirada
    ) {
      throw new Error(
        "A quilometragem não pode ser menor que a registrada no veículo ou na locação."
      );
    }
  }

  let valorFinal = locacao.valorTotal;

  if (vistoria.tipo === "DEVOLUCAO") {
    if (!retirada) {
      throw new Error(
        "Registre primeiro a vistoria de retirada."
      );
    }

    if (
      Date.parse(vistoria.data) <
      Date.parse(retirada.data)
    ) {
      throw new Error(
        "A devolução não pode ocorrer antes da retirada."
      );
    }

    if (
      vistoria.km < retirada.km ||
      vistoria.km < locacao.kmRetirada ||
      vistoria.km < veiculo.kmRodado
    ) {
      throw new Error(
        "O km de devolução não pode ser menor que a quilometragem registrada."
      );
    }

    const diariasPrevistas = calcularDiarias(
      locacao.dataRetirada,
      locacao.dataDevolucaoPrevista
    );

    if (diariasPrevistas <= 0) {
      throw new Error(
        "O período original da locação é inválido."
      );
    }

    const valorDiaria = Number(
      (
        locacao.valorTotal / diariasPrevistas
      ).toFixed(2)
    );

    if (
      !Number.isFinite(valorDiaria) ||
      valorDiaria <= 0
    ) {
      throw new Error(
        "O valor da diária é inválido."
      );
    }

    const diariasReais = Math.max(
      1,
      calcularDiarias(
        locacao.dataRetirada,
        dataVistoria
      )
    );

    valorFinal = Number(
      (diariasReais * valorDiaria).toFixed(2)
    );
  }

  const novaVistoria = await request<IVistoria>(
    "vistorias",
    {
      method: "POST",
      body: JSON.stringify(vistoria),
    }
  );

  if (!novaVistoria.id) {
    throw new Error(
      "Não foi possível identificar a vistoria criada."
    );
  }

  try {
    await request<IVeiculo>(
      `veiculos/${locacao.veiculoId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          kmRodado: vistoria.km,
        }),
      }
    );

    if (vistoria.tipo === "RETIRADA") {
      await request<ILocacao>(
        `locacoes/${vistoria.locacaoId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            kmRetirada: vistoria.km,
          }),
        }
      );
    } else {
      await request<ILocacao>(
        `locacoes/${vistoria.locacaoId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            dataDevolucaoReal: dataVistoria,
            kmDevolucao: vistoria.km,
            valorTotal: valorFinal,
            status: "FINALIZADA",
          }),
        }
      );
    }
  } catch {
    try {
      const locacaoAtual =
        await buscarLocacaoPorId(
          vistoria.locacaoId
        );

      const veiculoAtual =
        await buscarVeiculoPorId(
          locacao.veiculoId
        );

      const atualizacaoConcluida =
        veiculoAtual.kmRodado === vistoria.km &&
        (
          vistoria.tipo === "RETIRADA"
            ? locacaoAtual.kmRetirada === vistoria.km
            : locacaoAtual.status === "FINALIZADA" &&
              locacaoAtual.kmDevolucao === vistoria.km &&
              locacaoAtual.dataDevolucaoReal === dataVistoria &&
              locacaoAtual.valorTotal === valorFinal
        );

      if (atualizacaoConcluida) {
        return novaVistoria;
      }

      await request<ILocacao>(
        `locacoes/${vistoria.locacaoId}`,
        {
          method: "PUT",
          body: JSON.stringify(locacao),
        }
      );

      await request<IVeiculo>(
        `veiculos/${locacao.veiculoId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            kmRodado: veiculo.kmRodado,
          }),
        }
      );

      await remover(
        `vistorias/${novaVistoria.id}`
      );
    } catch {
      throw new Error(
        "Falha na atualização dos registros. Confira a locação, o veículo e a vistoria antes de tentar novamente."
      );
    }

    throw new Error(
      "Não foi possível concluir a vistoria. A operação foi desfeita."
    );
  }

  return novaVistoria;
}

export async function atualizarVistoria(
  id: string,
  vistoria: IVistoria
): Promise<IVistoria> {
  const atual = await buscarVistoriaPorId(id);

  if (
    atual.locacaoId !== vistoria.locacaoId ||
    atual.tipo !== vistoria.tipo ||
    atual.km !== vistoria.km ||
    atual.data !== vistoria.data
  ) {
    throw new Error(
      "Não é permitido alterar os dados operacionais de uma vistoria registrada."
    );
  }

  validarCampos(vistoria);

  return request<IVistoria>(
    `vistorias/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        nivelCombustivel:
          vistoria.nivelCombustivel,
        observacoes: vistoria.observacoes,
      }),
    }
  );
}

export async function excluirVistoria(
  id: string
): Promise<void> {
  await buscarVistoriaPorId(id);

  throw new Error(
    "Uma vistoria registrada não pode ser excluída individualmente."
  );
}
