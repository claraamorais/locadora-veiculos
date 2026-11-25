
import Button from "../../../components/Button";
import Card from "../../../components/Card";

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

import type {
  IModelo,
} from "../../../models/modelo.model";

import type {
  IContrato,
} from "../../../models/contrato.model";

import type {
  IPagamento,
} from "../../../models/pagamento.model";

import {
  calcularTotalPago,
} from "../../../models/pagamento.model";

interface NotaFiscalDetalheProps {
  notaFiscal: INotaFiscal;
  locacao?: ILocacao;
  cliente?: ICliente;
  veiculo?: IVeiculo;
  modelo?: IModelo;
  contrato?: IContrato;
  pagamentos: IPagamento[];
  onClose: () => void;
}

export default function NotaFiscalDetalhe({
  notaFiscal,
  locacao,
  cliente,
  veiculo,
  modelo,
  contrato,
  pagamentos,
  onClose,
}: NotaFiscalDetalheProps) {
  function moeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(
    data?: string
  ): string {
    if (!data) {
      return "-";
    }

    return data
      .slice(0, 10)
      .split("-")
      .reverse()
      .join("/");
  }

  const totalPago = calcularTotalPago(
    pagamentos
  );

  const saldo = Number(
    (notaFiscal.valor - totalPago).toFixed(2)
  );

  return (
    <Card>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }

            #notaFiscalImpressao,
            #notaFiscalImpressao * {
              visibility: visible;
            }

            #notaFiscalImpressao {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
              background: white;
              color: black;
            }

            .nao-imprimir {
              display: none !important;
            }

            @page {
              size: A4;
              margin: 15mm;
            }
          }
        `}
      </style>

      <div
        className="d-flex justify-content-between align-items-center mb-4 nao-imprimir"
      >
        <h4>Detalhes da nota fiscal</h4>

        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={() => window.print()}
          >
            Imprimir
          </Button>

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Voltar
          </Button>
        </div>
      </div>

      <div
        id="notaFiscalImpressao"
        className="border rounded p-4 bg-white text-dark"
      >
        <div className="text-center mb-4">
          <h2>LOCADORA DE VEÍCULOS</h2>

          <h4>Nota Fiscal de Locação</h4>

          <p className="text-muted">
            Documento acadêmico sem validade fiscal
          </p>
        </div>

        <div className="row border rounded p-3 mb-4">
          <div className="col-md-4">
            <strong>Número</strong>

            <p className="mb-0">
              {notaFiscal.numero}
            </p>
          </div>

          <div className="col-md-4">
            <strong>Série</strong>

            <p className="mb-0">
              {notaFiscal.serie}
            </p>
          </div>

          <div className="col-md-4">
            <strong>Data de emissão</strong>

            <p className="mb-0">
              {formatarData(
                notaFiscal.dataEmissao
              )}
            </p>
          </div>
        </div>

        <h5 className="border-bottom pb-2">
          Dados do cliente
        </h5>

        <div className="row mb-4">
          <div className="col-md-6">
            <p>
              <strong>Nome:</strong>{" "}
              {cliente?.nome ?? "-"}
            </p>

            <p>
              <strong>CPF:</strong>{" "}
              {cliente?.cpf ?? "-"}
            </p>

            <p>
              <strong>CNH:</strong>{" "}
              {cliente?.cnh ?? "-"}
            </p>
          </div>

          <div className="col-md-6">
            <p>
              <strong>E-mail:</strong>{" "}
              {cliente?.email ?? "-"}
            </p>

            <p>
              <strong>Telefone:</strong>{" "}
              {cliente?.telefone ?? "-"}
            </p>

            <p>
              <strong>Endereço:</strong>{" "}
              {cliente?.endereco ?? "-"}
            </p>
          </div>
        </div>

        <h5 className="border-bottom pb-2">
          Dados do veículo
        </h5>

        <div className="row mb-4">
          <div className="col-md-6">
            <p>
              <strong>Modelo:</strong>{" "}
              {modelo?.nome ?? "-"}
            </p>

            <p>
              <strong>Placa:</strong>{" "}
              {veiculo?.placa ?? "-"}
            </p>
          </div>

          <div className="col-md-6">
            <p>
              <strong>Cor:</strong>{" "}
              {veiculo?.cor ?? "-"}
            </p>

            <p>
              <strong>Ano:</strong>{" "}
              {veiculo?.anoFabricacao ?? "-"}
            </p>
          </div>
        </div>

        <h5 className="border-bottom pb-2">
          Dados da locação
        </h5>

        <div className="row mb-4">
          <div className="col-md-6">
            <p>
              <strong>Locação:</strong>{" "}
              {notaFiscal.locacaoId}
            </p>

            <p>
              <strong>Contrato:</strong>{" "}
              {contrato?.numero ?? "-"}
            </p>

            <p>
              <strong>Retirada:</strong>{" "}
              {formatarData(
                locacao?.dataRetirada
              )}
            </p>

            <p>
              <strong>Devolução:</strong>{" "}
              {formatarData(
                locacao?.dataDevolucaoReal
              )}
            </p>
          </div>

          <div className="col-md-6">
            <p>
              <strong>Km de retirada:</strong>{" "}
              {locacao?.kmRetirada
                .toLocaleString("pt-BR") ?? "-"}
            </p>

            <p>
              <strong>Km de devolução:</strong>{" "}
              {locacao?.kmDevolucao
                ?.toLocaleString("pt-BR") ?? "-"}
            </p>

            <p>
              <strong>Situação:</strong>{" "}
              Finalizada
            </p>
          </div>
        </div>

        <h5 className="border-bottom pb-2">
          Descrição do serviço
        </h5>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Descrição</th>
              <th className="text-end">
                Valor
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                Locação de veículo{" "}
                {modelo?.nome ?? ""}{" "}
                - {veiculo?.placa ?? "-"}
              </td>

              <td className="text-end">
                {moeda(notaFiscal.valor)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="border rounded p-3 mt-4">
          <p className="mb-2">
            <strong>Valor total da nota:</strong>{" "}
            {moeda(notaFiscal.valor)}
          </p>

          <p className="mb-2">
            <strong>Total pago:</strong>{" "}
            {moeda(totalPago)}
          </p>

          <p className="mb-2">
            <strong>Saldo restante:</strong>{" "}
            {moeda(Math.max(0, saldo))}
          </p>

          {saldo < 0 && (
            <p>
              <strong>Crédito do cliente:</strong>{" "}
              {moeda(-saldo)}
            </p>
          )}

          <h4 className="text-end mt-3">
            TOTAL: {moeda(notaFiscal.valor)}
          </h4>
        </div>

        <div className="text-center mt-5">
          <hr />

          <small>
            Documento emitido pelo Sistema de
            Locação de Veículos para fins
            exclusivamente acadêmicos.
            Sem validade fiscal.
          </small>
        </div>
      </div>
    </Card>
  );
}
