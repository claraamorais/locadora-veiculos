
import Button from "../../../components/Button";
import Table from "../../../components/Table";

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

interface LocacaoTableProps {
  locacoes: ILocacao[];
  clientes: ICliente[];
  veiculos: IVeiculo[];
  modelos: IModelo[];
  onEdit: (locacao: ILocacao) => void;
  onCancel: (id: string) => void;
}

export default function LocacaoTable({
  locacoes,
  clientes,
  veiculos,
  modelos,
  onEdit,
  onCancel,
}: LocacaoTableProps) {
  function formatarData(data: string): string {
    return data.split("-").reverse().join("/");
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
          render: (locacao) =>
            clientes.find(
              (cliente) =>
                cliente.id === locacao.clienteId
            )?.nome ?? "-",
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

            return (
              `${modelo?.nome ?? "-"} - ${veiculo?.placa ?? "-"}`
            );
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
          titulo: "Valor total",
          render: (locacao) =>
            locacao.valorTotal.toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency: "BRL",
              }
            ),
        },
        {
          titulo: "Status",
          render: (locacao) => {
            let cor = "bg-primary";
            let texto = "Aberta";

            if (
              locacao.status === "FINALIZADA"
            ) {
              cor = "bg-success";
              texto = "Finalizada";
            }

            if (
              locacao.status === "CANCELADA"
            ) {
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
            <div className="d-flex gap-2">
              {locacao.status === "ABERTA" ? (
                <>
                  <Button
                    variant="warning"
                    onClick={() =>
                      onEdit(locacao)
                    }
                  >
                    Editar
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => {
                      if (locacao.id) {
                        onCancel(locacao.id);
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <span className="text-muted">
                  Encerrada
                </span>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}
