
import Button from "../../../components/Button";
import Table from "../../../components/Table";

import type {
  IPagamento,
} from "../../../models/pagamento.model";

import {
  formatarFormaPagamento,
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

interface PagamentoTableProps {
  pagamentos: IPagamento[];
  locacoes: ILocacao[];
  clientes: ICliente[];
  veiculos: IVeiculo[];
  onEdit: (pagamento: IPagamento) => void;
  onConfirmar: (pagamento: IPagamento) => void;
  onCancelar: (pagamento: IPagamento) => void;
  onDelete: (pagamento: IPagamento) => void;
}

export default function PagamentoTable({
  pagamentos,
  locacoes,
  clientes,
  veiculos,
  onEdit,
  onConfirmar,
  onCancelar,
  onDelete,
}: PagamentoTableProps) {
  return (
    <Table<IPagamento>
      dados={pagamentos}
      colunas={[
        {
          titulo: "ID",
          render: (pagamento) =>
            pagamento.id,
        },
        {
          titulo: "Locação",
          render: (pagamento) =>
            pagamento.locacaoId,
        },
        {
          titulo: "Cliente",
          render: (pagamento) => {
            const locacao = locacoes.find(
              (item) =>
                item.id === pagamento.locacaoId
            );

            return (
              clientes.find(
                (item) =>
                  item.id === locacao?.clienteId
              )?.nome ?? "-"
            );
          },
        },
        {
          titulo: "Veículo",
          render: (pagamento) => {
            const locacao = locacoes.find(
              (item) =>
                item.id === pagamento.locacaoId
            );

            return (
              veiculos.find(
                (item) =>
                  item.id === locacao?.veiculoId
              )?.placa ?? "-"
            );
          },
        },
        {
          titulo: "Data",
          render: (pagamento) =>
            pagamento.data
              .slice(0, 10)
              .split("-")
              .reverse()
              .join("/"),
        },
        {
          titulo: "Valor",
          render: (pagamento) =>
            pagamento.valor.toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency: "BRL",
              }
            ),
        },
        {
          titulo: "Forma",
          render: (pagamento) =>
            formatarFormaPagamento(
              pagamento.forma
            ),
        },
        {
          titulo: "Status",
          render: (pagamento) => {
            let cor = "bg-warning text-dark";
            let texto = "Pendente";

            if (
              pagamento.status === "CONFIRMADO"
            ) {
              cor = "bg-success";
              texto = "Confirmado";
            }

            if (
              pagamento.status === "CANCELADO"
            ) {
              cor = "bg-danger";
              texto = "Cancelado";
            }

            return (
              <span className={`badge ${cor}`}>
                {texto}
              </span>
            );
          },
        },
        {
          titulo: "Ações",
          render: (pagamento) => (
            <div className="d-flex flex-wrap gap-1">
              {pagamento.status === "PENDENTE" && (
                <>
                  <Button
                    variant="warning"
                    className="btn-sm"
                    onClick={() =>
                      onEdit(pagamento)
                    }
                  >
                    Editar
                  </Button>

                  <Button
                    variant="success"
                    className="btn-sm"
                    onClick={() =>
                      onConfirmar(pagamento)
                    }
                  >
                    Confirmar
                  </Button>

                  <Button
                    variant="secondary"
                    className="btn-sm"
                    onClick={() =>
                      onCancelar(pagamento)
                    }
                  >
                    Cancelar
                  </Button>
                </>
              )}

              {pagamento.status !== "CONFIRMADO" && (
                <Button
                  variant="danger"
                  className="btn-sm"
                  onClick={() =>
                    onDelete(pagamento)
                  }
                >
                  Excluir
                </Button>
              )}

              {pagamento.status === "CONFIRMADO" && (
                <span className="text-muted">
                  Recebido
                </span>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}
