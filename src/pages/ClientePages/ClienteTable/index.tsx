
import Button from "../../../components/Button";
import Table from "../../../components/Table";

import type { ICliente } from "../../../models/cliente.model";

interface ClienteTableProps {
  clientes: ICliente[];
  onEdit: (cliente: ICliente) => void;
  onDelete: (id: string) => void;
}

export default function ClienteTable({
  clientes,
  onEdit,
  onDelete,
}: ClienteTableProps) {
  function formatarCpf(cpf: string): string {
    return cpf
      .replace(/\D/g, "")
      .replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
      );
  }

  function formatarTelefone(telefone: string): string {
    const numero = telefone.replace(/\D/g, "");

    if (numero.length === 11) {
      return numero.replace(
        /(\d{2})(\d{5})(\d{4})/,
        "($1) $2-$3"
      );
    }

    return numero.replace(
      /(\d{2})(\d{4})(\d{4})/,
      "($1) $2-$3"
    );
  }

  function cnhVencida(validade: string): boolean {
    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const dataValidade = new Date(
      `${validade}T00:00:00`
    );

    return dataValidade < hoje;
  }

  return (
    <Table<ICliente>
      dados={clientes}
      colunas={[
        {
          titulo: "ID",
          render: (cliente) => cliente.id,
        },
        {
          titulo: "Nome",
          render: (cliente) => cliente.nome,
        },
        {
          titulo: "CPF",
          render: (cliente) =>
            formatarCpf(cliente.cpf),
        },
        {
          titulo: "CNH",
          render: (cliente) => cliente.cnh,
        },
        {
          titulo: "Validade da CNH",
          render: (cliente) =>
            cliente.validadeCnh
              .split("-")
              .reverse()
              .join("/"),
        },
        {
          titulo: "Situação da CNH",
          render: (cliente) => (
            <span
              className={`badge ${
                cnhVencida(cliente.validadeCnh)
                  ? "bg-danger"
                  : "bg-success"
              }`}
            >
              {cnhVencida(cliente.validadeCnh)
                ? "Vencida"
                : "Válida"}
            </span>
          ),
        },
        {
          titulo: "Telefone",
          render: (cliente) =>
            formatarTelefone(cliente.telefone),
        },
        {
          titulo: "E-mail",
          render: (cliente) => cliente.email,
        },
        {
          titulo: "Endereço",
          render: (cliente) => cliente.endereco,
        },
        {
          titulo: "Ações",
          render: (cliente) => (
            <div className="d-flex gap-2">
              <Button
                variant="warning"
                onClick={() => onEdit(cliente)}
              >
                Editar
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  if (cliente.id) {
                    onDelete(cliente.id);
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
