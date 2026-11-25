
import { useState } from "react";
import type { FormEvent } from "react";

import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Alert from "../../../components/Alert";

import type {
  IPagamento,
  FormaPagamento,
  StatusPagamento,
} from "../../../models/pagamento.model";

import {
  calcularTotalPago,
  calcularSaldo,
} from "../../../models/pagamento.model";

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

interface PagamentoFormProps {
  pagamento?: IPagamento | null;
  pagamentos: IPagamento[];
  locacoes: ILocacao[];
  clientes: ICliente[];
  veiculos: IVeiculo[];
  onSave: (pagamento: IPagamento) => Promise<void>;
  onCancel: () => void;
}

export default function PagamentoForm(props: PagamentoFormProps) {
  return <PagamentoFormCampos key={props.pagamento?.id ?? "novo"} {...props} />;
}

function PagamentoFormCampos({
  pagamento,
  pagamentos,
  locacoes,
  clientes,
  veiculos,
  onSave,
  onCancel,
}: PagamentoFormProps) {
  const [locacaoId, setLocacaoId] =
    useState(pagamento?.locacaoId ?? "");

  const [data, setData] =
    useState(pagamento?.data.slice(0, 10) ?? dataHoje());

  const [valor, setValor] =
    useState(pagamento ? String(pagamento.valor) : "");

  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>(pagamento?.forma ?? "PIX");

  const [status, setStatus] =
    useState<StatusPagamento>(pagamento?.status ?? "PENDENTE");

  const [erro, setErro] =
    useState("");

  const [salvando, setSalvando] =
    useState(false);

  function limparCampos() {
    setLocacaoId("");
    setData(dataHoje());
    setValor("");
    setFormaPagamento("PIX");
    setStatus("PENDENTE");
    setErro("");
  }

  const locacoesPermitidas = locacoes.filter(
    (item) => item.status !== "CANCELADA"
  );

  const locacao = locacoes.find(
    (item) => item.id === locacaoId
  );

  const pagamentosLocacao = pagamentos.filter(
    (item) =>
      item.locacaoId === locacaoId &&
      item.id !== pagamento?.id
  );

  const totalPago = calcularTotalPago(
    pagamentosLocacao
  );

  const saldo = locacao
    ? calcularSaldo(
        locacao.valorTotal,
        pagamentosLocacao
      )
    : 0;

  function moeda(numero: number): string {
    return numero.toLocaleString("pt-BR", {
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
      setErro("Informe a data do pagamento.");
      return;
    }

    if (
      valor.trim() === "" ||
      !Number.isFinite(Number(valor)) ||
      Number(valor) <= 0
    ) {
      setErro(
        "Informe um valor maior que zero."
      );
      return;
    }

    if (
      status === "CONFIRMADO" &&
      Math.round(Number(valor) * 100) >
        Math.round(saldo * 100)
    ) {
      setErro(
        "O valor informado excede o saldo restante."
      );
      return;
    }

    setSalvando(true);

    try {
      await onSave({
        id: pagamento?.id,
        locacaoId,
        data,
        valor: Number(valor),
        forma: formaPagamento,
        status,
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

      <Select
        id="locacaoPagamento"
        label="Locação"
        value={locacaoId}
        disabled={!!pagamento}
        onChange={(event) => {
          setLocacaoId(event.target.value);
          setValor("");
          setErro("");
        }}
        opcoes={locacoesPermitidas.map(
          (item) => {
            const cliente = clientes.find(
              (c) => c.id === item.clienteId
            );

            const veiculo = veiculos.find(
              (v) => v.id === item.veiculoId
            );

            return {
              value: item.id ?? "",
              label:
                `${cliente?.nome ?? "-"} - ${veiculo?.placa ?? "-"} (${item.id})`,
            };
          }
        )}
      />

      {locacao && (
        <div className="bg-light border rounded p-3 mb-3">
          <h6>Resumo financeiro</h6>

          <p className="mb-1">
            <strong>Valor da locação:</strong>{" "}
            {moeda(locacao.valorTotal)}
          </p>

          <p className="mb-1 text-success">
            <strong>Total pago:</strong>{" "}
            {moeda(totalPago)}
          </p>

          <p className="mb-2 text-danger">
            <strong>Saldo restante:</strong>{" "}
            {moeda(Math.max(0, saldo))}
          </p>

          {saldo < 0 && (
            <p className="text-warning">
              Crédito do cliente:{" "}
              {moeda(-saldo)}
            </p>
          )}

          {saldo > 0 && (
            <Button
              variant="secondary"
              className="btn-sm"
              onClick={() =>
                setValor(saldo.toFixed(2))
              }
            >
              Utilizar saldo restante
            </Button>
          )}

          {saldo === 0 && (
            <span className="badge bg-success">
              Locação quitada
            </span>
          )}
        </div>
      )}

      <Input
        id="dataPagamento"
        label="Data do pagamento"
        type="date"
        value={data}
        onChange={(event) =>
          setData(event.target.value)
        }
      />

      <Input
        id="valorPagamento"
        label="Valor (R$)"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="0,00"
        value={valor}
        onChange={(event) =>
          setValor(event.target.value)
        }
      />

      <Select
        id="formaPagamento"
        label="Forma de pagamento"
        value={formaPagamento}
        onChange={(event) =>
          setFormaPagamento(
            event.target.value as FormaPagamento
          )
        }
        opcoes={[
          {
            value: "PIX",
            label: "Pix",
          },
          {
            value: "DINHEIRO",
            label: "Dinheiro",
          },
          {
            value: "CARTAO_CREDITO",
            label: "Cartão de crédito",
          },
          {
            value: "CARTAO_DEBITO",
            label: "Cartão de débito",
          },
          {
            value: "TRANSFERENCIA",
            label: "Transferência bancária",
          },
        ]}
      />

      <Select
        id="statusPagamento"
        label="Status"
        value={status}
        onChange={(event) =>
          setStatus(
            event.target.value as StatusPagamento
          )
        }
        opcoes={[
          {
            value: "PENDENTE",
            label: "Pendente",
          },
          {
            value: "CONFIRMADO",
            label: "Confirmado",
          },
        ]}
      />

      <div className="d-flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="success"
          disabled={salvando || !locacaoId}
        >
          {salvando
            ? "Salvando..."
            : pagamento
              ? "Atualizar"
              : "Cadastrar"}
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
