
import Button from "../../../components/Button";
import Table from "../../../components/Table";

import type {
  IVeiculo,
  IVeiculoComStatus,
} from "../../../models/veiculo.model";

import type {
  IModelo,
} from "../../../models/modelo.model";

interface VeiculoTableProps {
  veiculos: IVeiculoComStatus[];
  modelos: IModelo[];
  onEdit: (veiculo: IVeiculo) => void;
  onDelete: (veiculo: IVeiculo) => void;
}

export default function VeiculoTable({
  veiculos,
  modelos,
  onEdit,
  onDelete,
}: VeiculoTableProps) {
  return (
    <Table<IVeiculoComStatus>
      dados={veiculos}
      colunas={[
        {
          titulo: "ID",
          render: (veiculo) => veiculo.id,
        },
        {
          titulo: "Placa",
          render: (veiculo) => veiculo.placa,
        },
        {
          titulo: "Modelo",
          render: (veiculo) => {
            const modelo = modelos.find(
              (item) =>
                item.id === veiculo.modeloId
            );

            return modelo?.nome ?? "-";
          },
        },
        {
          titulo: "Chassi",
          render: (veiculo) => veiculo.chassi,
        },
        {
          titulo: "Ano",
          render: (veiculo) =>
            veiculo.anoFabricacao,
        },
        {
          titulo: "Cor",
          render: (veiculo) => veiculo.cor,
        },
        {
          titulo: "Quilometragem",
          render: (veiculo) =>
            `${veiculo.kmRodado.toLocaleString(
              "pt-BR"
            )} km`,
        },
        {
          titulo: "Disponibilidade",
          render: (veiculo) => {
            let cor = "";
            let texto = "";

            if (veiculo.status === "DISPONIVEL") {
              cor = "bg-success";
              texto = "Disponível";
            }

            if (veiculo.status === "LOCADO") {
              cor = "bg-primary";
              texto = "Locado";
            }

            if (
              veiculo.status === "EM_MANUTENCAO"
            ) {
              cor = "bg-warning text-dark";
              texto = "Em manutenção";
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
          render: (veiculo) => (
            <div className="d-flex flex-wrap gap-1">
              <Button
                variant="warning"
                className="btn-sm"
                onClick={() => onEdit(veiculo)}
              >
                Editar
              </Button>

              <Button
                variant="danger"
                className="btn-sm"
                onClick={() => onDelete(veiculo)}
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
