
import Button from "../../../components/Button";
import Table from "../../../components/Table";

import type { ICategoria } from "../../../models/categoria.model";

interface CategoriaTableProps {
  categorias: ICategoria[];
  onEdit: (categoria: ICategoria) => void;
  onDelete: (id: string) => void;
}

export default function CategoriaTable({
  categorias,
  onEdit,
  onDelete,
}: CategoriaTableProps) {
  return (
    <Table<ICategoria>
      dados={categorias}
      colunas={[
        {
          titulo: "ID",
          render: (categoria) => categoria.id,
        },
        {
          titulo: "Nome",
          render: (categoria) => categoria.nome,
        },
        {
          titulo: "Valor da diária",
          render: (categoria) =>
            categoria.valorLocacao.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
        },
        {
          titulo: "Ações",
          render: (categoria) => (
            <div className="d-flex gap-2">
              <Button
                variant="warning"
                onClick={() => onEdit(categoria)}
              >
                Editar
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  if (categoria.id) {
                    onDelete(categoria.id);
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
