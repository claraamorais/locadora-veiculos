
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Alert from "../../../components/Alert";

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

import type {
  ICategoria,
} from "../../../models/categoria.model";

import {
  calcularDiarias,
  calcularValorLocacao,
  dataHoje,
} from "../../../models/locacao.model";

interface LocacaoFormProps {
  locacao?: ILocacao | null;
  clientes: ICliente[];
  veiculos: IVeiculo[];
  modelos: IModelo[];
  categorias: ICategoria[];
  onSave: (locacao: ILocacao) => Promise<void>;
  onCancel: () => void;
}

export default function LocacaoForm({
  locacao,
  clientes,
  veiculos,
  modelos,
  categorias,
  onSave,
  onCancel,
}: LocacaoFormProps) {
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");

  const [dataRetirada, setDataRetirada] =
    useState(dataHoje());

  const [
    dataDevolucaoPrevista,
    setDataDevolucaoPrevista,
  ] = useState("");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setClienteId(locacao?.clienteId ?? "");
    setVeiculoId(locacao?.veiculoId ?? "");

    setDataRetirada(
      locacao?.dataRetirada ?? dataHoje()
    );

    setDataDevolucaoPrevista(
      locacao?.dataDevolucaoPrevista ?? ""
    );

    setErro("");
  }, [locacao]);

  const cliente = clientes.find(
    (item) => item.id === clienteId
  );

  const veiculo = veiculos.find(
    (item) => item.id === veiculoId
  );

  const modelo = modelos.find(
    (item) => item.id === veiculo?.modeloId
  );

  const categoria = categorias.find(
    (item) => item.id === modelo?.categoriaId
  );

  const valorDiaria =
    categoria?.valorLocacao ?? 0;

  const diarias = calcularDiarias(
    dataRetirada,
    dataDevolucaoPrevista
  );

  const valorTotal = calcularValorLocacao(
    dataRetirada,
    dataDevolucaoPrevista,
    valorDiaria
  );

  function moeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function limparCampos() {
    setClienteId("");
    setVeiculoId("");
    setDataRetirada(dataHoje());
    setDataDevolucaoPrevista("");
    setErro("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErro("");

    if (!cliente) {
      setErro("Selecione um cliente.");
      return;
    }

    if (
      cliente.validadeCnh < dataHoje() ||
      cliente.validadeCnh < dataRetirada
    ) {
      setErro("A CNH do cliente está vencida.");
      return;
    }

    if (!veiculo) {
      setErro("Selecione um veículo.");
      return;
    }

    if (diarias <= 0) {
      setErro(
        "A devolução deve ser posterior à retirada."
      );
      return;
    }

    if (valorTotal <= 0) {
      setErro("Valor da locação inválido.");
      return;
    }

    setSalvando(true);

    try {
      await onSave({
        id: locacao?.id,
        clienteId,
        veiculoId,
        dataRetirada,
        dataDevolucaoPrevista,
        kmRetirada:
          locacao?.kmRetirada ??
          veiculo.kmRodado,
        valorTotal,
        status: "ABERTA",
      });

      limparCampos();
    } catch {
      // O erro será exibido pela página.
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    limparCampos();
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit}>
      {erro && (
        <Alert variant="danger">
          {erro}
        </Alert>
      )}

      <Select
        id="clienteLocacao"
        label="Cliente"
        value={clienteId}
        disabled={!!locacao}
        onChange={(event) =>
          setClienteId(event.target.value)
        }
        opcoes={clientes.map((item) => ({
          value: item.id ?? "",
          label:
            item.nome +
            (
              item.validadeCnh < dataHoje()
                ? " - CNH vencida"
                : ""
            ),
        }))}
      />

      {cliente &&
        cliente.validadeCnh < dataHoje() && (
          <Alert variant="warning">
            Este cliente possui CNH vencida.
          </Alert>
        )}

      <Select
        id="veiculoLocacao"
        label="Veículo disponível"
        value={veiculoId}
        disabled={!!locacao}
        onChange={(event) =>
          setVeiculoId(event.target.value)
        }
        opcoes={veiculos.map((item) => {
          const modelo = modelos.find(
            (m) => m.id === item.modeloId
          );

          return {
            value: item.id ?? "",
            label:
              `${modelo?.nome ?? "Veículo"} - ${item.placa}`,
          };
        })}
      />

      <Input
        id="dataRetirada"
        label="Data de retirada"
        type="date"
        value={dataRetirada}
        onChange={(event) =>
          setDataRetirada(event.target.value)
        }
      />

      <Input
        id="dataDevolucaoPrevista"
        label="Devolução prevista"
        type="date"
        value={dataDevolucaoPrevista}
        onChange={(event) =>
          setDataDevolucaoPrevista(
            event.target.value
          )
        }
      />

      <Input
        id="kmRetirada"
        label="Quilometragem atual"
        type="number"
        value={
          locacao?.kmRetirada ??
          veiculo?.kmRodado ??
          0
        }
        readOnly
      />

      <div className="bg-light border rounded p-3 mb-3">
        <p className="mb-2">
          <strong>Categoria:</strong>{" "}
          {categoria?.nome ?? "-"}
        </p>

        <p className="mb-2">
          <strong>Valor da diária:</strong>{" "}
          {moeda(valorDiaria)}
        </p>

        <p className="mb-2">
          <strong>Quantidade de diárias:</strong>{" "}
          {diarias}
        </p>

        <hr />

        <p className="mb-0 text-success fs-5">
          <strong>
            Total: {moeda(valorTotal)}
          </strong>
        </p>
      </div>

      <div className="d-flex gap-2">
        <Button
          type="submit"
          variant="success"
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : locacao
              ? "Atualizar"
              : "Registrar locação"}
        </Button>

        <Button
          variant="secondary"
          onClick={cancelar}
          disabled={salvando}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
