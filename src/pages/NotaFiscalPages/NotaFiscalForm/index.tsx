
import { useState } from "react";
import type { FormEvent } from "react";

import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Alert from "../../../components/Alert";

import type {
  INotaFiscal,
} from "../../../models/notaFiscal.model";

import {
  notaFiscalInicial,
} from "../../../models/notaFiscal.model";

import type {
  ILocacao,
} from "../../../models/locacao.model";

import type {
  ICliente,
} from "../../../models/cliente.model";

import type {
  IVeiculo,
} from "../../../models/veiculo.model";

import {
  dataHoje,
} from "../../../models/locacao.model";

interface NotaFiscalFormProps {
  notasFiscais: INotaFiscal[];
  locacoes: ILocacao[];
  clientes: ICliente[];
  veiculos: IVeiculo[];
  onSave: (
    notaFiscal: INotaFiscal
  ) => Promise<void>;
}

export default function NotaFiscalForm({
  notasFiscais,
  locacoes,
  clientes,
  veiculos,
  onSave,
}: NotaFiscalFormProps) {
  const [locacaoId, setLocacaoId] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [salvando, setSalvando] =
    useState(false);

  const locacoesDisponiveis = locacoes.filter(
    (locacao) =>
      locacao.status === "FINALIZADA" &&
      !notasFiscais.some(
        (nota) =>
          nota.locacaoId === locacao.id
      )
  );

  const locacao = locacoesDisponiveis.find(
    (item) => item.id === locacaoId
  );

  const cliente = clientes.find(
    (item) => item.id === locacao?.clienteId
  );

  const veiculo = veiculos.find(
    (item) => item.id === locacao?.veiculoId
  );

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
      setErro(
        "Selecione uma locação finalizada."
      );
      return;
    }

    setSalvando(true);

    try {
      await onSave({
        ...notaFiscalInicial,
        locacaoId,
        numero: `NF-${locacaoId}`,
        dataEmissao: dataHoje(),
        valor: locacao.valorTotal,
      });

      setLocacaoId("");
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

      {locacoesDisponiveis.length === 0 && (
        <Alert variant="info">
          Não existem locações finalizadas
          aguardando emissão de nota fiscal.
        </Alert>
      )}

      <Select
        id="locacaoNotaFiscal"
        label="Locação finalizada"
        value={locacaoId}
        onChange={(event) => {
          setLocacaoId(event.target.value);
          setErro("");
        }}
        opcoes={locacoesDisponiveis.map(
          (item) => {
            const clienteLocacao =
              clientes.find(
                (c) => c.id === item.clienteId
              );

            const veiculoLocacao =
              veiculos.find(
                (v) => v.id === item.veiculoId
              );

            return {
              value: item.id ?? "",
              label:
                `${clienteLocacao?.nome ?? "-"} - ${veiculoLocacao?.placa ?? "-"}`,
            };
          }
        )}
      />

      <Input
        id="numeroNotaFiscal"
        label="Número da nota fiscal"
        value={
          locacaoId
            ? `NF-${locacaoId}`
            : "Gerado automaticamente"
        }
        readOnly
      />

      <Input
        id="serieNotaFiscal"
        label="Série"
        value="001"
        readOnly
      />

      <Input
        id="dataEmissaoNotaFiscal"
        label="Data de emissão"
        type="date"
        value={dataHoje()}
        readOnly
      />

      <Input
        id="valorNotaFiscal"
        label="Valor total"
        value={
          locacao
            ? moeda(locacao.valorTotal)
            : "R$ 0,00"
        }
        readOnly
      />

      {locacao && (
        <div className="bg-light border rounded p-3 mb-3">
          <h6>Dados da locação</h6>

          <p className="mb-1">
            <strong>Cliente:</strong>{" "}
            {cliente?.nome ?? "-"}
          </p>

          <p className="mb-1">
            <strong>Veículo:</strong>{" "}
            {veiculo?.placa ?? "-"}
          </p>

          <p className="mb-1">
            <strong>Retirada:</strong>{" "}
            {locacao.dataRetirada
              .slice(0, 10)
              .split("-")
              .reverse()
              .join("/")}
          </p>

          <p className="mb-1">
            <strong>Devolução:</strong>{" "}
            {locacao.dataDevolucaoReal
              ?.slice(0, 10)
              .split("-")
              .reverse()
              .join("/") ?? "-"}
          </p>

          <span className="badge bg-success">
            Finalizada
          </span>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="success"
          disabled={salvando || !locacao}
        >
          {salvando
            ? "Emitindo..."
            : "Emitir nota fiscal"}
        </Button>

        <Button
          variant="secondary"
          disabled={salvando}
          onClick={() => {
            setLocacaoId("");
            setErro("");
          }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
