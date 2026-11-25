
import Table from "../../../components/Table";

import type {
  IVistoria,
} from "../../../models/vistoria.model";

import type {
  ILocacao,
} from "../../../models/locacao.model";

import type {
  ICliente,
} from "../../../models/cliente.model";

import type {
  IVeiculo,
} from "../../../models/veiculo.model";

import type {
  IModelo,
} from "../../../models/modelo.model";

interface VistoriaTableProps {
  vistorias: IVistoria[];
  locacoes: ILocacao[];
  clientes: ICliente[];
  veiculos: IVeiculo[];
  modelos: IModelo[];
}

export default function VistoriaTable({
  vistorias,
  locacoes,
  clientes,
  veiculos,
  modelos,
}: VistoriaTableProps) {
  return (
    <Table<IVistoria>
      dados={vistorias}
      colunas={[
        {
          titulo: "ID",
          render: (vistoria) => vistoria.id,
        },
        {
          titulo: "Locação",
          render: (vistoria) =>
            vistoria.locacaoId,
        },
        {
          titulo: "Cliente",
          render: (vistoria) => {
            const locacao = locacoes.find(
              (item) =>
                item.id === vistoria.locacaoId
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
          render: (vistoria) => {
            const locacao = locacoes.find(
              (item) =>
                item.id === vistoria.locacaoId
            );

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
          titulo: "Tipo",
          render: (vistoria) => (
            <span
              className={
                vistoria.tipo === "RETIRADA"
                  ? "badge bg-primary"
                  : "badge bg-success"
              }
            >
              {vistoria.tipo === "RETIRADA"
                ? "Retirada"
                : "Devolução"}
            </span>
          ),
        },
        {
          titulo: "Data",
          render: (vistoria) =>
            vistoria.data
              .slice(0, 10)
              .split("-")
              .reverse()
              .join("/"),
        },
        {
          titulo: "Quilometragem",
          render: (vistoria) =>
            `${vistoria.km.toLocaleString("pt-BR")} km`,
        },
        {
          titulo: "Combustível",
          render: (vistoria) =>
            vistoria.nivelCombustivel,
        },
        {
          titulo: "Observações",
          render: (vistoria) =>
            vistoria.observacoes || "-",
        },
      ]}
    />
  );
}
