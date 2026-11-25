
import { useEffect, useState } from "react";

import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Select from "../../components/Select";
import Modal from "../../components/Modal";

import PagamentoForm from "./PagamentoForm";
import PagamentoTable from "./PagamentoTable";

import type {
  IPagamento,
} from "../../models/pagamento.model";

import {
  calcularTotalPago,
} from "../../models/pagamento.model";

import type {
  ILocacao,
} from "../../models/locacao.model";

import type {
  ICliente,
} from "../../models/cliente.model";

import type {
  IVeiculo,
} from "../../models/veiculo.model";

import {
  listarPagamentos,
  criarPagamento,
  atualizarPagamento,
  confirmarPagamento,
  cancelarPagamento,
  excluirPagamento,
} from "../../service/pagamento.service";

import {
  listarLocacoes,
} from "../../service/locacao.service";

import {
  listarClientes,
} from "../../service/cliente.service";

import {
  listarVeiculos,
} from "../../service/veiculo.service";

type AcaoPagamento =
  | "CONFIRMAR"
  | "CANCELAR"
  | "EXCLUIR";

interface ConfirmacaoPagamento {
  pagamento: IPagamento;
  acao: AcaoPagamento;
}

export default function PagamentoPages() {
  const [pagamentos, setPagamentos] =
    useState<IPagamento[]>([]);

  const [locacoes, setLocacoes] =
    useState<ILocacao[]>([]);

  const [clientes, setClientes] =
    useState<ICliente[]>([]);

  const [veiculos, setVeiculos] =
    useState<IVeiculo[]>([]);

  const [pagamentoEditando, setPagamentoEditando] =
    useState<IPagamento | null>(null);

  const [confirmacao, setConfirmacao] =
    useState<ConfirmacaoPagamento | null>(null);

  const [filtroLocacao, setFiltroLocacao] =
    useState("");

  const [filtroStatus, setFiltroStatus] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [processando, setProcessando] =
    useState(false);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [
        dadosPagamentos,
        dadosLocacoes,
        dadosClientes,
        dadosVeiculos,
      ] = await Promise.all([
        listarPagamentos(),
        listarLocacoes(),
        listarClientes(),
        listarVeiculos(),
      ]);

      setPagamentos(dadosPagamentos);
      setLocacoes(dadosLocacoes);
      setClientes(dadosClientes);
      setVeiculos(dadosVeiculos);
    } catch {
      setErro(
        "Erro ao carregar os pagamentos."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const inicio = window.setTimeout(() => {
      void carregarDados();
    }, 0);

    return () => window.clearTimeout(inicio);
  }, []);

  async function salvarPagamento(
    pagamento: IPagamento
  ) {
    setErro("");
    setMensagem("");

    try {
      if (pagamento.id) {
        await atualizarPagamento(
          pagamento.id,
          pagamento
        );

        setMensagem(
          "Pagamento atualizado com sucesso!"
        );
      } else {
        await criarPagamento(pagamento);

        setMensagem(
          "Pagamento cadastrado com sucesso!"
        );
      }

      setPagamentoEditando(null);

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar pagamento."
      );

      throw error;
    }
  }

  async function executarAcao() {
    if (
      !confirmacao?.pagamento.id ||
      processando
    ) {
      return;
    }

    setErro("");
    setMensagem("");
    setProcessando(true);

    const id = confirmacao.pagamento.id;

    try {
      if (confirmacao.acao === "CONFIRMAR") {
        await confirmarPagamento(id);

        setMensagem(
          "Pagamento confirmado com sucesso!"
        );
      }

      if (confirmacao.acao === "CANCELAR") {
        await cancelarPagamento(id);

        setMensagem(
          "Pagamento cancelado com sucesso!"
        );
      }

      if (confirmacao.acao === "EXCLUIR") {
        await excluirPagamento(id);

        setMensagem(
          "Pagamento excluído com sucesso!"
        );
      }

      setConfirmacao(null);
      setPagamentoEditando(null);

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao executar a operação."
      );

      setConfirmacao(null);
    } finally {
      setProcessando(false);
    }
  }

  function moeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const pagamentosFiltrados = pagamentos
    .filter(
      (item) =>
        (
          !filtroLocacao ||
          item.locacaoId === filtroLocacao
        ) &&
        (
          !filtroStatus ||
          item.status === filtroStatus
        )
    )
    .sort(
      (a, b) => b.data.localeCompare(a.data)
    );

  const totalRecebido = calcularTotalPago(
    pagamentos
  );

  const totalPendente = pagamentos
    .filter(
      (item) => item.status === "PENDENTE"
    )
    .reduce(
      (soma, item) =>
        soma + Math.round(item.valor * 100),
      0
    ) / 100;

  const totalAReceber = locacoes
    .filter(
      (item) => item.status !== "CANCELADA"
    )
    .reduce((soma, locacao) => {
      const pagamentosLocacao =
        pagamentos.filter(
          (item) =>
            item.locacaoId === locacao.id
        );

      const pago = calcularTotalPago(
        pagamentosLocacao
      );

      return soma + Math.max(
        0,
        Math.round(locacao.valorTotal * 100) -
        Math.round(pago * 100)
      );
    }, 0) / 100;

  const titulosModal: Record<
    AcaoPagamento,
    string
  > = {
    CONFIRMAR: "Confirmar pagamento",
    CANCELAR: "Cancelar pagamento",
    EXCLUIR: "Excluir pagamento",
  };

  const textosModal: Record<
    AcaoPagamento,
    string
  > = {
    CONFIRMAR:
      "Deseja confirmar o recebimento deste pagamento?",
    CANCELAR:
      "Deseja cancelar este pagamento pendente?",
    EXCLUIR:
      "Deseja excluir este pagamento?",
  };

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      <h2 className="mb-4">
        Gerenciamento de Pagamentos
      </h2>

      {mensagem && (
        <Alert variant="success">
          {mensagem}
        </Alert>
      )}

      {erro && (
        <Alert variant="danger">
          {erro}
        </Alert>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <Card titulo="Total recebido">
            <h4 className="text-success">
              {moeda(totalRecebido)}
            </h4>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Pagamentos pendentes">
            <h4 className="text-warning">
              {moeda(totalPendente)}
            </h4>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Total a receber">
            <h4 className="text-danger">
              {moeda(totalAReceber)}
            </h4>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Total de registros">
            <h4>{pagamentos.length}</h4>
          </Card>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-3">
          <Card
            titulo={
              pagamentoEditando
                ? "Editar pagamento"
                : "Novo pagamento"
            }
          >
            <PagamentoForm
              pagamento={pagamentoEditando}
              pagamentos={pagamentos}
              locacoes={locacoes}
              clientes={clientes}
              veiculos={veiculos}
              onSave={salvarPagamento}
              onCancel={() => {
                setPagamentoEditando(null);
                setErro("");
                setMensagem("");
              }}
            />
          </Card>
        </div>

        <div className="col-lg-9">
          <Card titulo="Histórico de Pagamentos">
            <div className="row">
              <div className="col-md-6">
                <Select
                  id="filtroLocacaoPagamento"
                  label="Filtrar por locação"
                  value={filtroLocacao}
                  onChange={(event) =>
                    setFiltroLocacao(
                      event.target.value
                    )
                  }
                  opcoes={locacoes.map(
                    (item) => {
                      const cliente = clientes.find(
                        (c) =>
                          c.id === item.clienteId
                      );

                      const veiculo = veiculos.find(
                        (v) =>
                          v.id === item.veiculoId
                      );

                      return {
                        value: item.id ?? "",
                        label:
                          `${cliente?.nome ?? "-"} - ${veiculo?.placa ?? "-"} (${item.id})`,
                      };
                    }
                  )}
                />
              </div>

              <div className="col-md-6">
                <Select
                  id="filtroStatusPagamento"
                  label="Filtrar por status"
                  value={filtroStatus}
                  onChange={(event) =>
                    setFiltroStatus(
                      event.target.value
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
                    {
                      value: "CANCELADO",
                      label: "Cancelado",
                    },
                  ]}
                />
              </div>
            </div>

            {carregando ? (
              <p>Carregando pagamentos...</p>
            ) : (
              <>
                <p className="text-muted">
                  Exibindo{" "}
                  {pagamentosFiltrados.length}
                  {" "}de {pagamentos.length}
                  {" "}pagamentos.
                </p>

                <PagamentoTable
                  pagamentos={pagamentosFiltrados}
                  locacoes={locacoes}
                  clientes={clientes}
                  veiculos={veiculos}
                  onEdit={(pagamento) => {
                    setPagamentoEditando(pagamento);
                    setErro("");
                    setMensagem("");
                  }}
                  onConfirmar={(pagamento) =>
                    setConfirmacao({
                      pagamento,
                      acao: "CONFIRMAR",
                    })
                  }
                  onCancelar={(pagamento) =>
                    setConfirmacao({
                      pagamento,
                      acao: "CANCELAR",
                    })
                  }
                  onDelete={(pagamento) =>
                    setConfirmacao({
                      pagamento,
                      acao: "EXCLUIR",
                    })
                  }
                />
              </>
            )}
          </Card>
        </div>
      </div>

      <Modal
        aberto={!!confirmacao}
        titulo={
          confirmacao
            ? titulosModal[confirmacao.acao]
            : ""
        }
        onClose={() => {
          if (!processando) {
            setConfirmacao(null);
          }
        }}
        onConfirm={executarAcao}
      >
        {confirmacao && (
          <>
            <p>
              {textosModal[confirmacao.acao]}
            </p>

            <p>
              <strong>Valor:</strong>{" "}
              {moeda(
                confirmacao.pagamento.valor
              )}
            </p>

            {processando && (
              <p>Processando...</p>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
