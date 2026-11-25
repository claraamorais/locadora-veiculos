
import Button from "../../../components/Button";
import Table from "../../../components/Table";

import type { IVeiculo } from "../../../models/veiculo.model";
import type { IModelo } from "../../../models/modelo.model";

interface VeiculoTableProps {
  veiculos: IVeiculo[];
  modelos: IModelo[];
  onEdit: (veiculo: IVeiculo) => void;
  onDelete: (id: string) => void;
}

export default function VeiculoTable({
  veiculos,
  modelos,
  onEdit,
  onDelete,
}: VeiculoTableProps) {
  return (
    <Table<IVeiculo>
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
          render: (veiculo) =>
            modelos.find(
              (modelo) => modelo.id === veiculo.modeloId
            )?.nome ?? "Não encontrado",
        },
        {
          titulo: "Chassi",
          render: (veiculo) => veiculo.chassi,
        },
        {
          titulo: "Ano",
          render: (veiculo) => veiculo.anoFabricacao,
        },
        {
          titulo: "Cor",
          render: (veiculo) => veiculo.cor,
        },
        {
          titulo: "Quilometragem",
          render: (veiculo) =>
            `${veiculo.kmRodado.toLocaleString("pt-BR")} km`,
        },
        {
          titulo: "Ações",
          render: (veiculo) => (
            <div className="d-flex gap-2">
              <Button
                variant="warning"
                onClick={() => onEdit(veiculo)}
              >
                Editar
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  if (veiculo.id) {
                    onDelete(veiculo.id);
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
