
import Button from "../../../components/Button";
import Table from "../../../components/Table";

import type {
  INotaFiscal,
} from "../../../models/notaFiscal.model";

import type {
  ILocacao,
} from "../../../models/locacao.model";

import type {
  ICliente,
} from "../../../models/cliente.model";

import type {
  IVeiculo,
} from "../../../models/veiculo.model";

interface NotaFiscalTableProps {
  notasFiscais: INotaFiscal[];
  locacoes: ILocacao[];
  clientes: ICliente[];
  veiculos: IVeiculo[];
  onVisualizar: (
    notaFiscal: INotaFiscal
  ) => void;
}

export default function NotaFiscalTable({
  notasFiscais,
  locacoes,
  clientes,
  veiculos,
  onVisualizar,
}: NotaFiscalTableProps) {
  return (
    <Table<INotaFiscal>
      dados={notasFiscais}
      colunas={[
        {
          titulo: "Número",
          render: (nota) => nota.numero,
        },
        {
          titulo: "Série",
          render: (nota) => nota.serie,
        },
        {
          titulo: "Locação",
          render: (nota) => nota.locacaoId,
        },
        {
          titulo: "Cliente",
          render: (nota) => {
            const locacao = locacoes.find(
              (item) =>
                item.id === nota.locacaoId
            );

            return (
              clientes.find(
                (item) =>
                  item.id === locacao?.clienteId
              )?.nome ?? "-"
            );
          },
        },
        {
          titulo: "Veículo",
          render: (nota) => {
            const locacao = locacoes.find(
              (item) =>
                item.id === nota.locacaoId
            );

            return (
              veiculos.find(
                (item) =>
                  item.id === locacao?.veiculoId
              )?.placa ?? "-"
            );
          },
        },
        {
          titulo: "Emissão",
          render: (nota) =>
            nota.dataEmissao
              .slice(0, 10)
              .split("-")
              .reverse()
              .join("/"),
        },
        {
          titulo: "Valor",
          render: (nota) =>
            nota.valor.toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency: "BRL",
              }
            ),
        },
        {
          titulo: "Situação",
          render: () => (
            <span className="badge bg-success">
              Emitida
            </span>
          ),
        },
        {
          titulo: "Ações",
          render: (nota) => (
            <Button
              variant="primary"
              className="btn-sm"
              onClick={() =>
                onVisualizar(nota)
              }
            >
              Visualizar
            </Button>
          ),
        },
      ]}
    />
  );
}
