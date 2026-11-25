
import Button from "../../../components/Button";
import Table from "../../../components/Table";

import type { IManutencao } from "../../../models/manutencao.model";
import type { IVeiculo } from "../../../models/veiculo.model";
import type { IModelo } from "../../../models/modelo.model";

interface ManutencaoTableProps {
  manutencoes: IManutencao[];
  veiculos: IVeiculo[];
  modelos: IModelo[];
  onEdit: (manutencao: IManutencao) => void;
  onDelete: (id: string) => void;
}

export default function ManutencaoTable({
  manutencoes,
  veiculos,
  modelos,
  onEdit,
  onDelete,
}: ManutencaoTableProps) {
  return (
    <Table<IManutencao>
      dados={manutencoes}
      colunas={[
        {
          titulo: "ID",
          render: (manutencao) => manutencao.id,
        },
        {
          titulo: "Veículo",
          render: (manutencao) => {
            const veiculo = veiculos.find(
              (item) =>
                item.id === manutencao.veiculoId
            );

            const modelo = modelos.find(
              (item) =>
                item.id === veiculo?.modeloId
            );

            return veiculo
              ? `${modelo?.nome ?? "Modelo desconhecido"} - ${veiculo.placa}`
              : "Não encontrado";
          },
        },
        {
          titulo: "Data",
          render: (manutencao) =>
            manutencao.data
              .split("-")
              .reverse()
              .join("/"),
        },
        {
          titulo: "Descrição",
          render: (manutencao) =>
            manutencao.descricao,
        },
        {
          titulo: "Valor",
          render: (manutencao) =>
            manutencao.valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
        },
        {
          titulo: "Status",
          render: (manutencao) => (
            <span
              className={`badge ${
                manutencao.status === "CONCLUIDA"
                  ? "bg-success"
                  : "bg-warning text-dark"
              }`}
            >
              {manutencao.status === "CONCLUIDA"
                ? "Concluída"
                : "Em andamento"}
            </span>
          ),
        },
        {
          titulo: "Ações",
          render: (manutencao) => (
            <div className="d-flex gap-2">
              <Button
                variant="warning"
                onClick={() => onEdit(manutencao)}
              >
                Editar
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  if (manutencao.id) {
                    onDelete(manutencao.id);
                  }
                }}
              >
                Excluir
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}
