
import { useEffect, useState } from "react";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import Alert from "../../../components/Alert";
import Table from "../../../components/Table";

import type { ILocacao } from "../../../models/locacao.model";
import type { ICliente } from "../../../models/cliente.model";
import type { IVeiculo } from "../../../models/veiculo.model";
import type { IModelo } from "../../../models/modelo.model";
import type { IMarca } from "../../../models/marca.model";
import type { ICategoria } from "../../../models/categoria.model";
import type { IContrato } from "../../../models/contrato.model";
import type { IVistoria } from "../../../models/vistoria.model";
import type { IPagamento } from "../../../models/pagamento.model";
import type { INotaFiscal } from "../../../models/notaFiscal.model";

import {
  calcularDiarias,
} from "../../../models/locacao.model";

import {
  calcularTotalPago,
  formatarFormaPagamento,
} from "../../../models/pagamento.model";

import {
  buscarLocacaoPorId,
} from "../../../service/locacao.service";

import {
  buscarClientePorId,
} from "../../../service/cliente.service";

import {
  buscarVeiculoPorId,
} from "../../../service/veiculo.service";

import {
  buscarModeloPorId,
} from "../../../service/modelo.service";

import {
  buscarMarcaPorId,
} from "../../../service/marca.service";

import {
  buscarCategoriaPorId,
} from "../../../service/categoria.service";

import {
  buscarContratoPorLocacao,
} from "../../../service/contrato.service";

import {
  listarVistoriasPorLocacao,
} from "../../../service/vistoria.service";

import {
  listarPagamentosPorLocacao,
} from "../../../service/pagamento.service";

import {
  buscarNotaFiscalPorLocacao,
} from "../../../service/notaFiscal.service";

interface LocacaoDetalheProps {
  locacaoId: string;
  onClose: () => void;
}

interface DadosLocacao {
  locacao: ILocacao;
  cliente: ICliente;
  veiculo: IVeiculo;
  modelo: IModelo;
  marca: IMarca;
  categoria: ICategoria;
  contrato?: IContrato;
  vistorias: IVistoria[];
  pagamentos: IPagamento[];
  notaFiscal?: INotaFiscal;
}

export default function LocacaoDetalhe({
  locacaoId,
  onClose,
}: LocacaoDetalheProps) {
  const [dados, setDados] =
    useState<DadosLocacao | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDetalhes() {
      setCarregando(true);
      setErro("");
      setDados(null);

      try {
        const locacao =
          await buscarLocacaoPorId(locacaoId);

        const [
          cliente,
          veiculo,
          contrato,
          vistorias,
          pagamentos,
          notaFiscal,
        ] = await Promise.all([
          buscarClientePorId(locacao.clienteId),
          buscarVeiculoPorId(locacao.veiculoId),
          buscarContratoPorLocacao(locacaoId),
          listarVistoriasPorLocacao(locacaoId),
          listarPagamentosPorLocacao(locacaoId),
          buscarNotaFiscalPorLocacao(locacaoId),
        ]);

        const modelo =
          await buscarModeloPorId(veiculo.modeloId);

        const [marca, categoria] =
          await Promise.all([
            buscarMarcaPorId(modelo.marcaId),
            buscarCategoriaPorId(modelo.categoriaId),
          ]);

        if (ativo) {
          setDados({
            locacao,
            cliente,
            veiculo,
            modelo,
            marca,
            categoria,
            contrato: contrato ?? undefined,
            vistorias,
            pagamentos,
            notaFiscal: notaFiscal ?? undefined,
          });
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Erro ao carregar os detalhes."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDetalhes();

    return () => {
      ativo = false;
    };
  }, [locacaoId]);

  function moeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data?: string): string {
    if (!data) {
      return "-";
    }

    return data
      .slice(0, 10)
      .split("-")
      .reverse()
      .join("/");
  }

  function formatarKm(km?: number): string {
    if (km === undefined) {
      return "-";
    }

    return `${km.toLocaleString("pt-BR")} km`;
  }

  if (carregando) {
    return (
      <Card titulo="Detalhes da locação">
        <p>Carregando informações...</p>

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Voltar
        </Button>
      </Card>
    );
  }

  if (erro || !dados) {
    return (
      <Card titulo="Detalhes da locação">
        <Alert variant="danger">
          {erro || "Locação não encontrada."}
        </Alert>

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Voltar
        </Button>
      </Card>
    );
  }

  const {
    locacao,
    cliente,
    veiculo,
    modelo,
    marca,
    categoria,
    contrato,
    vistorias,
    pagamentos,
    notaFiscal,
  } = dados;

  const totalPago =
    calcularTotalPago(pagamentos);

  const saldo = Number(
    (locacao.valorTotal - totalPago).toFixed(2)
  );

  const diariasPrevistas = calcularDiarias(
    locacao.dataRetirada,
    locacao.dataDevolucaoPrevista
  );

  const diariasReais = locacao.dataDevolucaoReal
    ? Math.max(
        1,
        calcularDiarias(
          locacao.dataRetirada,
          locacao.dataDevolucaoReal.slice(0, 10)
        )
      )
    : undefined;

  const kmPercorrido =
    locacao.kmDevolucao !== undefined
      ? locacao.kmDevolucao - locacao.kmRetirada
      : undefined;

  const statusLocacao = {
    ABERTA: {
      texto: "Aberta",
      cor: "bg-warning text-dark",
    },
    FINALIZADA: {
      texto: "Finalizada",
      cor: "bg-success",
    },
    CANCELADA: {
      texto: "Cancelada",
      cor: "bg-danger",
    },
  };

  const status = statusLocacao[locacao.status];

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h3>Detalhes da Locação</h3>

          <p className="text-muted mb-2">
            Identificação: {locacao.id}
          </p>

          <span className={`badge ${status.cor}`}>
            {status.texto}
          </span>
        </div>

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Voltar para locações
        </Button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card titulo="Valor total">
            <h4>{moeda(locacao.valorTotal)}</h4>
          </Card>
        </div>

        <div className="col-md-4">
          <Card titulo="Total pago">
            <h4 className="text-success">
              {moeda(totalPago)}
            </h4>
          </Card>
        </div>

        <div className="col-md-4">
          <Card titulo="Saldo restante">
            <h4 className={
              saldo > 0
                ? "text-danger"
                : "text-success"
            }>
              {locacao.status === "CANCELADA"
                ? "Não aplicável"
                : moeda(Math.max(0, saldo))}
            </h4>

            {saldo < 0 && (
              <p className="text-warning mb-0">
                Crédito do cliente: {moeda(-saldo)}
              </p>
            )}
          </Card>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <Card titulo="Dados do cliente">
            <p>
              <strong>Nome:</strong>{" "}
              {cliente.nome}
            </p>

            <p>
              <strong>CPF:</strong>{" "}
              {cliente.cpf}
            </p>

            <p>
              <strong>CNH:</strong>{" "}
              {cliente.cnh}
            </p>

            <p>
              <strong>Validade da CNH:</strong>{" "}
              {formatarData(cliente.validadeCnh)}
            </p>

            <p>
              <strong>Telefone:</strong>{" "}
              {cliente.telefone}
            </p>

            <p>
              <strong>E-mail:</strong>{" "}
              {cliente.email}
            </p>

            <p className="mb-0">
              <strong>Endereço:</strong>{" "}
              {cliente.endereco}
            </p>
          </Card>
        </div>

        <div className="col-lg-6">
          <Card titulo="Dados do veículo">
            <p>
              <strong>Marca:</strong>{" "}
              {marca.nome}
            </p>

            <p>
              <strong>Modelo:</strong>{" "}
              {modelo.nome}
            </p>

            <p>
              <strong>Categoria:</strong>{" "}
              {categoria.nome}
            </p>

            <p>
              <strong>Placa:</strong>{" "}
              {veiculo.placa}
            </p>

            <p>
              <strong>Chassi:</strong>{" "}
              {veiculo.chassi}
            </p>

            <p>
              <strong>Ano de fabricação:</strong>{" "}
              {veiculo.anoFabricacao}
            </p>

            <p className="mb-0">
              <strong>Cor:</strong>{" "}
              {veiculo.cor}
            </p>
          </Card>
        </div>

        <div className="col-lg-6">
          <Card titulo="Informações da locação">
            <p>
              <strong>Data de retirada:</strong>{" "}
              {formatarData(locacao.dataRetirada)}
            </p>

            <p>
              <strong>Devolução prevista:</strong>{" "}
              {formatarData(
                locacao.dataDevolucaoPrevista
              )}
            </p>

            <p>
              <strong>Devolução real:</strong>{" "}
              {formatarData(
                locacao.dataDevolucaoReal
              )}
            </p>

            <p>
              <strong>Diárias previstas:</strong>{" "}
              {diariasPrevistas}
            </p>

            <p>
              <strong>Diárias utilizadas:</strong>{" "}
              {diariasReais ?? "-"}
            </p>

            <p>
              <strong>Diária atual da categoria:</strong>{" "}
              {moeda(categoria.valorLocacao)}
            </p>

            <p>
              <strong>Km de retirada:</strong>{" "}
              {formatarKm(locacao.kmRetirada)}
            </p>

            <p>
              <strong>Km de devolução:</strong>{" "}
              {formatarKm(locacao.kmDevolucao)}
            </p>

            <p className="mb-0">
              <strong>Distância percorrida:</strong>{" "}
              {formatarKm(kmPercorrido)}
            </p>
          </Card>
        </div>

        <div className="col-lg-6">
          <Card titulo="Contrato">
            {contrato ? (
              <>
                <p>
                  <strong>Número:</strong>{" "}
                  {contrato.numero}
                </p>

                <p>
                  <strong>Data de emissão:</strong>{" "}
                  {formatarData(
                    contrato.dataEmissao
                  )}
                </p>

                <p>
                  <strong>Termos do contrato:</strong>
                </p>

                <div
                  className="bg-light border rounded p-3"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {contrato.termos}
                </div>
              </>
            ) : (
              <Alert variant="warning">
                Nenhum contrato encontrado.
              </Alert>
            )}
          </Card>
        </div>
      </div>

      <div className="mb-4">
        <Card titulo="Vistorias">
          {vistorias.length === 0 ? (
            <Alert variant="info">
              Nenhuma vistoria registrada.
            </Alert>
          ) : (
            <Table<IVistoria>
              dados={vistorias}
              colunas={[
                {
                  titulo: "Tipo",
                  render: (item) => (
                    <span className={
                      item.tipo === "RETIRADA"
                        ? "badge bg-primary"
                        : "badge bg-success"
                    }>
                      {item.tipo === "RETIRADA"
                        ? "Retirada"
                        : "Devolução"}
                    </span>
                  ),
                },
                {
                  titulo: "Data",
                  render: (item) =>
                    formatarData(item.data),
                },
                {
                  titulo: "Quilometragem",
                  render: (item) =>
                    formatarKm(item.km),
                },
                {
                  titulo: "Combustível",
                  render: (item) =>
                    item.nivelCombustivel,
                },
                {
                  titulo: "Observações",
                  render: (item) =>
                    item.observacoes || "-",
                },
              ]}
            />
          )}
        </Card>
      </div>

      <div className="mb-4">
        <Card titulo="Histórico de pagamentos">
          {pagamentos.length === 0 ? (
            <Alert variant="info">
              Nenhum pagamento registrado.
            </Alert>
          ) : (
            <Table<IPagamento>
              dados={pagamentos}
              colunas={[
                {
                  titulo: "Data",
                  render: (item) =>
                    formatarData(item.data),
                },
                {
                  titulo: "Forma de pagamento",
                  render: (item) =>
                    formatarFormaPagamento(
                      item.formaPagamento
                    ),
                },
                {
                  titulo: "Valor",
                  render: (item) =>
                    moeda(item.valor),
                },
                {
                  titulo: "Status",
                  render: (item) => {
                    const estilos = {
                      PENDENTE: {
                        texto: "Pendente",
                        cor: "bg-warning text-dark",
                      },
                      CONFIRMADO: {
                        texto: "Confirmado",
                        cor: "bg-success",
                      },
                      CANCELADO: {
                        texto: "Cancelado",
                        cor: "bg-danger",
                      },
                    };

                    const situacao =
                      estilos[item.status];

                    return (
                      <span className={
                        `badge ${situacao.cor}`
                      }>
                        {situacao.texto}
                      </span>
                    );
                  },
                },
              ]}
            />
          )}

          <div className="border-top pt-3">
            <p>
              <strong>Total confirmado:</strong>{" "}
              {moeda(totalPago)}
            </p>

            {locacao.status !== "CANCELADA" && (
              <p className="mb-0">
                <strong>Saldo restante:</strong>{" "}
                {moeda(Math.max(0, saldo))}
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mb-4">
        <Card titulo="Nota fiscal">
          {notaFiscal ? (
            <>
              <div className="mb-3">
                <span className="badge bg-success">
                  Emitida
                </span>
              </div>

              <div className="row">
                <div className="col-md-3">
                  <p>
                    <strong>Número:</strong>{" "}
                    {notaFiscal.numero}
                  </p>
                </div>

                <div className="col-md-3">
                  <p>
                    <strong>Série:</strong>{" "}
                    {notaFiscal.serie}
                  </p>
                </div>

                <div className="col-md-3">
                  <p>
                    <strong>Emissão:</strong>{" "}
                    {formatarData(
                      notaFiscal.dataEmissao
                    )}
                  </p>
                </div>

                <div className="col-md-3">
                  <p>
                    <strong>Valor:</strong>{" "}
                    {moeda(notaFiscal.valor)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <Alert variant="info">
              {locacao.status === "FINALIZADA"
                ? "Nota fiscal aguardando emissão."
                : "Não existe nota fiscal para esta locação."}
            </Alert>
          )}
        </Card>
      </div>
    </div>
  );
}
