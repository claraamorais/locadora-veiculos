
import Button from "../../../components/Button";
import Card from "../../../components/Card";

import type { IContrato } from "../../../models/contrato.model";
import type { ILocacao } from "../../../models/locacao.model";
import type { ICliente } from "../../../models/cliente.model";
import type { IVeiculo } from "../../../models/veiculo.model";
import type { IModelo } from "../../../models/modelo.model";
import type { ICategoria } from "../../../models/categoria.model";

interface ContratoDetalheProps {
  contrato: IContrato;
  locacao?: ILocacao;
  cliente?: ICliente;
  veiculo?: IVeiculo;
  modelo?: IModelo;
  categoria?: ICategoria;
  onClose: () => void;
}

export default function ContratoDetalhe({
  contrato,
  locacao,
  cliente,
  veiculo,
  modelo,
  categoria,
  onClose,
}: ContratoDetalheProps) {
  function formatarData(data?: string): string {
    if (!data) {
      return "-";
    }

    return data.split("-").reverse().join("/");
  }

  function moeda(valor?: number): string {
    if (valor === undefined) {
      return "-";
    }

    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="mt-4" id="contrato-detalhe">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #contrato-detalhe,
          #contrato-detalhe * {
            visibility: visible;
          }

          #contrato-detalhe {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
          }

          #contrato-detalhe .d-print-none,
          #contrato-detalhe .d-print-none * {
            display: none !important;
          }

          #contrato-detalhe .card {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <Card>
        <div className="text-center mb-4">
          <h3>Contrato de Locação de Veículo</h3>

          <h5>{contrato.numero}</h5>

          <p className="text-muted">
            Emitido em{" "}
            {formatarData(contrato.dataEmissao)}
          </p>
        </div>

        <hr />

        <h5>1. Dados do cliente</h5>

        <div className="row mb-3">
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

            <p>
              <strong>Validade da CNH:</strong>{" "}
              {formatarData(cliente?.validadeCnh)}
            </p>
          </div>

          <div className="col-md-6">
            <p>
              <strong>Telefone:</strong>{" "}
              {cliente?.telefone ?? "-"}
            </p>

            <p>
              <strong>E-mail:</strong>{" "}
              {cliente?.email ?? "-"}
            </p>

            <p>
              <strong>Endereço:</strong>{" "}
              {cliente?.endereco ?? "-"}
            </p>
          </div>
        </div>

        <hr />

        <h5>2. Dados do veículo</h5>

        <div className="row mb-3">
          <div className="col-md-6">
            <p>
              <strong>Modelo:</strong>{" "}
              {modelo?.nome ?? "-"}
            </p>

            <p>
              <strong>Placa:</strong>{" "}
              {veiculo?.placa ?? "-"}
            </p>

            <p>
              <strong>Chassi:</strong>{" "}
              {veiculo?.chassi ?? "-"}
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

            <p>
              <strong>Categoria:</strong>{" "}
              {categoria?.nome ?? "-"}
            </p>
          </div>
        </div>

        <hr />

        <h5>3. Dados da locação</h5>

        <div className="row mb-3">
          <div className="col-md-6">
            <p>
              <strong>Data de retirada:</strong>{" "}
              {formatarData(locacao?.dataRetirada)}
            </p>

            <p>
              <strong>Devolução prevista:</strong>{" "}
              {formatarData(
                locacao?.dataDevolucaoPrevista
              )}
            </p>

            <p>
              <strong>Devolução real:</strong>{" "}
              {formatarData(
                locacao?.dataDevolucaoReal
              )}
            </p>

            <p>
              <strong>Km de retirada:</strong>{" "}
              {locacao?.kmRetirada ?? "-"}
            </p>
          </div>

          <div className="col-md-6">
            <p>
              <strong>Status:</strong>{" "}
              {locacao?.status ?? "-"}
            </p>

            <p className="fs-5 text-success">
              <strong>
                Valor da locação:{" "}
                {moeda(locacao?.valorTotal)}
              </strong>
            </p>
          </div>
        </div>

        <hr />

        <h5>4. Termos do contrato</h5>

        <p style={{ whiteSpace: "pre-wrap" }}>
          {contrato.termos}
        </p>

        <div className="row text-center mt-5 mb-4">
          <div className="col-6">
            <div className="border-top pt-2">
              {cliente?.nome ?? "Cliente"}

              <br />

              Locatário
            </div>
          </div>

          <div className="col-6">
            <div className="border-top pt-2">
              Locadora

              <br />

              Responsável
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 d-print-none">
          <Button
            variant="primary"
            onClick={() => window.print()}
          >
            Imprimir contrato
          </Button>

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </Card>
    </div>
  );
}
