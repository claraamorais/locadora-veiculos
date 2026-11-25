
import { useState } from "react";
import type { FormEvent } from "react";

import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import TextArea from "../../../components/TextArea";
import Alert from "../../../components/Alert";

import type {
  IVistoria,
  TipoVistoria,
  NivelCombustivel,
} from "../../../models/vistoria.model";

import type {
  ILocacao,
} from "../../../models/locacao.model";

import type {
  ICliente,
} from "../../../models/cliente.model";

import type {
  IVeiculo,
} from "../../../models/veiculo.model";

import type {
  IModelo,
} from "../../../models/modelo.model";

import {
  dataHoje,
  calcularDiarias,
} from "../../../models/locacao.model";

interface VistoriaFormProps {
  locacoes: ILocacao[];
  vistorias: IVistoria[];
  clientes: ICliente[];
  veiculos: IVeiculo[];
  modelos: IModelo[];
  onSave: (vistoria: IVistoria) => Promise<void>;
  onCancel: () => void;
}

export default function VistoriaForm({
  locacoes,
  vistorias,
  clientes,
  veiculos,
  modelos,
  onSave,
  onCancel,
}: VistoriaFormProps) {
  const [locacaoId, setLocacaoId] =
    useState("");

  const [tipo, setTipo] =
    useState<TipoVistoria>("RETIRADA");

  const [data, setData] =
    useState(dataHoje());

  const [km, setKm] = useState("");

  const [nivelCombustivel, setNivelCombustivel] =
    useState<NivelCombustivel>("CHEIO");

  const [observacoes, setObservacoes] =
    useState("");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] =
    useState(false);

  const locacoesAbertas = locacoes.filter(
    (item) => item.status === "ABERTA"
  );

  const locacao = locacoes.find(
    (item) => item.id === locacaoId
  );

  const cliente = clientes.find(
    (item) => item.id === locacao?.clienteId
  );

  const veiculo = veiculos.find(
    (item) => item.id === locacao?.veiculoId
  );

  const modelo = modelos.find(
    (item) => item.id === veiculo?.modeloId
  );

  const retirada = vistorias.find(
    (item) =>
      item.locacaoId === locacaoId &&
      item.tipo === "RETIRADA"
  );

  const devolucao = vistorias.find(
    (item) =>
      item.locacaoId === locacaoId &&
      item.tipo === "DEVOLUCAO"
  );

  const kmMinimo = Math.max(
    retirada?.km ?? 0,
    locacao?.kmRetirada ?? 0,
    veiculo?.kmRodado ?? 0
  );

  const diariasPrevistas = locacao
    ? calcularDiarias(
        locacao.dataRetirada,
        locacao.dataDevolucaoPrevista
      )
    : 0;

  const valorDiaria =
    locacao && diariasPrevistas > 0
      ? Number(
          (
            locacao.valorTotal / diariasPrevistas
          ).toFixed(2)
        )
      : 0;

  const diariasReais =
    locacao && data >= locacao.dataRetirada
      ? Math.max(
          1,
          calcularDiarias(
            locacao.dataRetirada,
            data
          )
        )
      : 0;

  const valorFinal = Number(
    (diariasReais * valorDiaria).toFixed(2)
  );

  function selecionarLocacao(id: string) {
    setLocacaoId(id);
    setErro("");
    setObservacoes("");
    setNivelCombustivel("CHEIO");

    const selecionada = locacoes.find(
      (item) => item.id === id
    );

    const veiculoSelecionado = veiculos.find(
      (item) =>
        item.id === selecionada?.veiculoId
    );

    const retiradaRegistrada = vistorias.find(
      (item) =>
        item.locacaoId === id &&
        item.tipo === "RETIRADA"
    );

    if (retiradaRegistrada) {
      setTipo("DEVOLUCAO");
      setData(dataHoje());

      setKm(
        String(
          Math.max(
            retiradaRegistrada.km,
            veiculoSelecionado?.kmRodado ?? 0
          )
        )
      );
    } else {
      setTipo("RETIRADA");

      setData(
        selecionada?.dataRetirada ??
        dataHoje()
      );

      setKm(
        String(
          Math.max(
            selecionada?.kmRetirada ?? 0,
            veiculoSelecionado?.kmRodado ?? 0
          )
        )
      );
    }
  }

  function limparCampos() {
    setLocacaoId("");
    setTipo("RETIRADA");
    setData(dataHoje());
    setKm("");
    setNivelCombustivel("CHEIO");
    setObservacoes("");
    setErro("");
  }

  function moeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErro("");

    if (!locacao) {
      setErro("Selecione uma locação.");
      return;
    }

    if (!data) {
      setErro("Informe a data da vistoria.");
      return;
    }

    if (
      km.trim() === "" ||
      !Number.isInteger(Number(km)) ||
      Number(km) < kmMinimo
    ) {
      setErro(
        `A quilometragem deve ser igual ou superior a ${kmMinimo} km.`
      );

      return;
    }

    if (
      tipo === "RETIRADA" &&
      retirada
    ) {
      setErro(
        "A vistoria de retirada já foi registrada."
      );

      return;
    }

    if (
      tipo === "DEVOLUCAO" &&
      !retirada
    ) {
      setErro(
        "Registre primeiro a vistoria de retirada."
      );

      return;
    }

    if (
      tipo === "DEVOLUCAO" &&
      data < locacao.dataRetirada
    ) {
      setErro(
        "A devolução não pode ocorrer antes da retirada."
      );

      return;
    }

    if (devolucao) {
      setErro(
        "A vistoria de devolução já foi registrada."
      );

      return;
    }

    setSalvando(true);

    try {
      await onSave({
        locacaoId,
        tipo,
        data: `${data}T00:00:00`,
        km: Number(km),
        nivelCombustivel,
        observacoes: observacoes.trim(),
      });

      limparCampos();
    } catch {
      // A página principal exibirá o erro.
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {erro && (
        <Alert variant="danger">
          {erro}
        </Alert>
      )}

      {locacoesAbertas.length === 0 && (
        <Alert variant="warning">
          Não existem locações abertas.
        </Alert>
      )}

      <Select
        id="locacaoVistoria"
        label="Locação"
        value={locacaoId}
        onChange={(event) =>
          selecionarLocacao(event.target.value)
        }
        opcoes={locacoesAbertas.map((item) => {
          const cliente = clientes.find(
            (c) => c.id === item.clienteId
          );

          const veiculo = veiculos.find(
            (v) => v.id === item.veiculoId
          );

          return {
            value: item.id ?? "",
            label:
              `${cliente?.nome ?? "-"} - ${veiculo?.placa ?? "-"}`,
          };
        })}
      />

      {locacao && (
        <div className="bg-light border rounded p-3 mb-3">
          <p className="mb-1">
            <strong>Cliente:</strong>{" "}
            {cliente?.nome ?? "-"}
          </p>

          <p className="mb-1">
            <strong>Veículo:</strong>{" "}
            {modelo?.nome ?? "-"}
          </p>

          <p className="mb-0">
            <strong>Placa:</strong>{" "}
            {veiculo?.placa ?? "-"}
          </p>
        </div>
      )}

      <Select
        id="tipoVistoria"
        label="Tipo de vistoria"
        value={tipo}
        disabled
        onChange={(event) =>
          setTipo(
            event.target.value as TipoVistoria
          )
        }
        opcoes={[
          {
            value: "RETIRADA",
            label: "Retirada",
          },
          {
            value: "DEVOLUCAO",
            label: "Devolução",
          },
        ]}
      />

      <Input
        id="dataVistoria"
        label="Data da vistoria"
        type="date"
        value={data}
        readOnly={tipo === "RETIRADA"}
        min={locacao?.dataRetirada}
        onChange={(event) =>
          setData(event.target.value)
        }
      />

      <Input
        id="kmVistoria"
        label="Quilometragem"
        type="number"
        min={kmMinimo}
        step="1"
        value={km}
        onChange={(event) =>
          setKm(event.target.value)
        }
      />

      <Select
        id="combustivelVistoria"
        label="Nível de combustível"
        value={nivelCombustivel}
        onChange={(event) =>
          setNivelCombustivel(
            event.target.value as NivelCombustivel
          )
        }
        opcoes={[
          {
            value: "VAZIO",
            label: "Vazio",
          },
          {
            value: "1/4",
            label: "1/4 do tanque",
          },
          {
            value: "1/2",
            label: "Meio tanque",
          },
          {
            value: "3/4",
            label: "3/4 do tanque",
          },
          {
            value: "CHEIO",
            label: "Tanque cheio",
          },
        ]}
      />

      <TextArea
        id="observacoesVistoria"
        label="Observações"
        rows={4}
        value={observacoes}
        onChange={(event) =>
          setObservacoes(event.target.value)
        }
      />

      {tipo === "DEVOLUCAO" && locacao && (
        <>
          <div className="bg-light border rounded p-3 mb-3">
            <h6>Resumo da devolução</h6>

            <p className="mb-1">
              <strong>Diárias previstas:</strong>{" "}
              {diariasPrevistas}
            </p>

            <p className="mb-1">
              <strong>Diárias utilizadas:</strong>{" "}
              {diariasReais}
            </p>

            <p className="mb-1">
              <strong>Valor previsto:</strong>{" "}
              {moeda(locacao.valorTotal)}
            </p>

            <hr />

            <p className="text-success fs-5 mb-0">
              <strong>
                Total: {moeda(valorFinal)}
              </strong>
            </p>
          </div>

          <Alert variant="warning">
            Ao registrar a devolução, a locação
            será finalizada e o veículo será liberado.
          </Alert>
        </>
      )}

      <div className="d-flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="success"
          disabled={
            salvando ||
            !locacaoId ||
            !!devolucao
          }
        >
          {salvando
            ? "Salvando..."
            : tipo === "RETIRADA"
              ? "Registrar retirada"
              : "Finalizar locação"}
        </Button>

        <Button
          variant="secondary"
          disabled={salvando}
          onClick={() => {
            limparCampos();
            onCancel();
          }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
