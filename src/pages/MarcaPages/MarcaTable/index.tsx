
import Button from "../../../components/Button";
import Table from "../../../components/Table";
import type { IMarca } from "../../../models/marca.model";

interface MarcaTableProps {
  marcas: IMarca[];
  onEdit: (marca: IMarca) => void;
  onDelete: (id: string) => void;
}

export default function MarcaTable({
  marcas,
  onEdit,
  onDelete,
}: MarcaTableProps) {
  return (
    <Table<IMarca>
      dados={marcas}
      colunas={[
        {
          titulo: "ID",
          render: (marca) => marca.id,
        },
        {
          titulo: "Nome",
          render: (marca) => marca.nome,
        },
        {
          titulo: "Ações",
          render: (marca) => (
            <div className="d-flex gap-2">
              <Button
                variant="warning"
                onClick={() => onEdit(marca)}
              >
                Editar
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  if (marca.id) {
                    onDelete(marca.id);
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
