
import Button from "../../../components/Button";
import Table from "../../../components/Table";

import type { IContrato } from "../../../models/contrato.model";
import type { ILocacao } from "../../../models/locacao.model";
import type { ICliente } from "../../../models/cliente.model";
import type { IVeiculo } from "../../../models/veiculo.model";
import type { IModelo } from "../../../models/modelo.model";

interface ContratoTableProps {
  contratos: IContrato[];
  locacoes: ILocacao[];
  clientes: ICliente[];
  veiculos: IVeiculo[];
  modelos: IModelo[];
  onVisualizar: (contrato: IContrato) => void;
}

export default function ContratoTable({
  contratos,
  locacoes,
  clientes,
  veiculos,
  modelos,
  onVisualizar,
}: ContratoTableProps) {
  function buscarLocacao(contrato: IContrato) {
    return locacoes.find(
      (locacao) => locacao.id === contrato.locacaoId
    );
  }

  return (
    <Table<IContrato>
      dados={contratos}
      colunas={[
        {
          titulo: "Número do contrato",
          render: (contrato) => contrato.numero,
        },
        {
          titulo: "Data de emissão",
          render: (contrato) =>
            contrato.dataEmissao
              .split("-")
              .reverse()
              .join("/"),
        },
        {
          titulo: "Cliente",
          render: (contrato) => {
            const locacao = buscarLocacao(contrato);

            return (
              clientes.find(
                (cliente) =>
                  cliente.id === locacao?.clienteId
              )?.nome ?? "-"
            );
          },
        },
        {
          titulo: "Veículo",
          render: (contrato) => {
            const locacao = buscarLocacao(contrato);

            const veiculo = veiculos.find(
              (item) =>
                item.id === locacao?.veiculoId
            );

            const modelo = modelos.find(
              (item) =>
                item.id === veiculo?.modeloId
            );

            return `${modelo?.nome ?? "-"} - ${veiculo?.placa ?? "-"}`;
          },
        },
        {
          titulo: "Valor da locação",
          render: (contrato) => {
            const locacao = buscarLocacao(contrato);

            return locacao
              ? locacao.valorTotal.toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                )
              : "-";
          },
        },
        {
          titulo: "Status da locação",
          render: (contrato) => {
            const locacao = buscarLocacao(contrato);

            if (!locacao) {
              return "-";
            }

            let cor = "bg-primary";
            let texto = "Aberta";

            if (locacao.status === "FINALIZADA") {
              cor = "bg-success";
              texto = "Finalizada";
            }

            if (locacao.status === "CANCELADA") {
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
          render: (contrato) => (
            <Button
              variant="primary"
              onClick={() => onVisualizar(contrato)}
            >
              Visualizar
            </Button>
          ),
        },
      ]}
    />
  );
}
