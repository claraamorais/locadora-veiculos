import type { ReactNode } from "react";

interface Column<T> {
  titulo: string;
  render: (item: T) => ReactNode;
}

interface TableProps<T> {
  dados: T[];
  colunas: Column<T>[];
}

export default function Table<T>({
  dados,
  colunas,
}: TableProps<T>) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            {colunas.map((coluna, index) => (
              <th key={index}>{coluna.titulo}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {dados.map((item, index) => (
            <tr key={index}>
              {colunas.map((coluna, i) => (
                <td key={i}>{coluna.render(item)}</td>
              ))}
            </tr>
          ))}

          {dados.length === 0 && (
            <tr>
              <td colSpan={colunas.length} className="text-center">
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
