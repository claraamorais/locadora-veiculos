
import { useNavigate } from "react-router-dom";

import Button from "../../../components/Button";
import Table from "../../../components/Table";

import type { ILocacao } from "../../../models/locacao.model";
import type { ICliente } from "../../../models/cliente.model";
import type { IVeiculo } from "../../../models/veiculo.model";
import type { IModelo } from "../../../models/modelo.model";

import {
  calcularDiarias,
} from "../../../models/locacao.model";

interface LocacaoTableProps {
  locacoes: ILocacao[];
  clientes: ICliente[];
  veiculos: IVeiculo[];
  modelos: IModelo[];
  onEdit: (locacao: ILocacao) => void;
  onCancel: (id: string) => void;
  onDelete?: (locacao: ILocacao) => void;
}

export default function LocacaoTable({
  locacoes,
  clientes,
  veiculos,
  modelos,
  onEdit,
  onCancel,
  onDelete,
}: LocacaoTableProps) {
  const navigate = useNavigate();

  function formatarData(data?: string): string {
    if (!data) {
      return "-";
    }

    return data
      .slice(0, 10)
      .split("-")
      .reverse()
      .join("/");
  }

  function moeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <Table<ILocacao>
      dados={locacoes}
      colunas={[
        {
          titulo: "ID",
          render: (locacao) => locacao.id,
        },
        {
          titulo: "Cliente",
          render: (locacao) => {
            const cliente = clientes.find(
              (item) =>
                item.id === locacao.clienteId
            );

            return cliente?.nome ?? "-";
          },
        },
        {
          titulo: "Veículo",
          render: (locacao) => {
            const veiculo = veiculos.find(
              (item) =>
                item.id === locacao.veiculoId
            );

            const modelo = modelos.find(
              (item) =>
                item.id === veiculo?.modeloId
            );

            if (!veiculo) {
              return "-";
            }

            return `${modelo?.nome ?? "-"} - ${veiculo.placa}`;
          },
        },
        {
          titulo: "Retirada",
          render: (locacao) =>
            formatarData(locacao.dataRetirada),
        },
        {
          titulo: "Devolução prevista",
          render: (locacao) =>
            formatarData(
              locacao.dataDevolucaoPrevista
            ),
        },
        {
          titulo: "Devolução real",
          render: (locacao) =>
            formatarData(
              locacao.dataDevolucaoReal
            ),
        },
        {
          titulo: "Diárias",
          render: (locacao) => {
            if (locacao.dataDevolucaoReal) {
              return Math.max(
                1,
                calcularDiarias(
                  locacao.dataRetirada,
                  locacao.dataDevolucaoReal.slice(0, 10)
                )
              );
            }

            return calcularDiarias(
              locacao.dataRetirada,
              locacao.dataDevolucaoPrevista
            );
          },
        },
        {
          titulo: "Km retirada",
          render: (locacao) =>
            locacao.kmRetirada.toLocaleString(
              "pt-BR"
            ),
        },
        {
          titulo: "Km devolução",
          render: (locacao) =>
            locacao.kmDevolucao?.toLocaleString(
              "pt-BR"
            ) ?? "-",
        },
        {
          titulo: "Valor total",
          render: (locacao) =>
            moeda(locacao.valorTotal),
        },
        {
          titulo: "Status",
          render: (locacao) => {
            let cor = "";
            let texto = "";

            if (locacao.status === "ABERTA") {
              cor = "bg-warning text-dark";
              texto = "Aberta";
            }

            if (locacao.status === "FINALIZADA") {
              cor = "bg-success";
              texto = "Finalizada";
            }

            if (locacao.status === "CANCELADA") {
              cor = "bg-danger";
              texto = "Cancelada";
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
          render: (locacao) => (
            <div className="d-flex flex-wrap gap-1">
              <Button
                variant="primary"
                className="btn-sm"
                disabled={!locacao.id}
                onClick={() => {
                  if (locacao.id) {
                    navigate(
                      `/locacoes/${locacao.id}`
                    );
                  }
                }}
              >
                Visualizar
              </Button>

              {locacao.status === "ABERTA" && (
                <>
                  <Button
                    variant="warning"
                    className="btn-sm"
                    onClick={() =>
                      onEdit(locacao)
                    }
                  >
                    Editar
                  </Button>

                  <Button
                    variant="danger"
                    className="btn-sm"
                    disabled={!locacao.id}
                    onClick={() => {
                      if (locacao.id) {
                        onCancel(locacao.id);
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                </>
              )}

              {locacao.status === "CANCELADA" &&
                onDelete && (
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() =>
                      onDelete(locacao)
                    }
                  >
                    Excluir
                  </Button>
                )}
            </div>
          ),
        },
      ]}
    />
  );
}
