
import Button from "../../../components/Button";
import Table from "../../../components/Table";

import type { IModelo } from "../../../models/modelo.model";
import type { IMarca } from "../../../models/marca.model";
import type { ICategoria } from "../../../models/categoria.model";

interface ModeloTableProps {
  modelos: IModelo[];
  marcas: IMarca[];
  categorias: ICategoria[];
  onEdit: (modelo: IModelo) => void;
  onDelete: (id: string) => void;
}

export default function ModeloTable({
  modelos,
  marcas,
  categorias,
  onEdit,
  onDelete,
}: ModeloTableProps) {
  return (
    <Table<IModelo>
      dados={modelos}
      colunas={[
        {
          titulo: "ID",
          render: (modelo) => modelo.id,
        },
        {
          titulo: "Nome",
          render: (modelo) => modelo.nome,
        },
        {
          titulo: "Ano",
          render: (modelo) => modelo.ano,
        },
        {
          titulo: "Marca",
          render: (modelo) =>
            marcas.find(
              (marca) => marca.id === modelo.marcaId
            )?.nome ?? "Não encontrada",
        },
        {
          titulo: "Categoria",
          render: (modelo) =>
            categorias.find(
              (categoria) =>
                categoria.id === modelo.categoriaId
            )?.nome ?? "Não encontrada",
        },
        {
          titulo: "Ações",
          render: (modelo) => (
            <div className="d-flex gap-2">
              <Button
                variant="warning"
                onClick={() => onEdit(modelo)}
              >
                Editar
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  if (modelo.id) {
                    onDelete(modelo.id);
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
