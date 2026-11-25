
import { useEffect, useState } from "react";

import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Input from "../../components/Input";

import NotaFiscalForm from "./NotaFiscalForm";
import NotaFiscalTable from "./NotaFiscalTable";
import NotaFiscalDetalhe from "./NotaFiscalDetalhe";

import type {
  INotaFiscal,
} from "../../models/notaFiscal.model";

import type {
  ILocacao,
} from "../../models/locacao.model";

import type {
  ICliente,
} from "../../models/cliente.model";

import type {
  IVeiculo,
} from "../../models/veiculo.model";

import type {
  IModelo,
} from "../../models/modelo.model";

import type {
  IContrato,
} from "../../models/contrato.model";

import type {
  IPagamento,
} from "../../models/pagamento.model";

import {
  listarNotasFiscais,
  criarNotaFiscal,
} from "../../service/notaFiscal.service";

import {
  listarLocacoes,
} from "../../service/locacao.service";

import {
  listarClientes,
} from "../../service/cliente.service";

import {
  listarVeiculos,
} from "../../service/veiculo.service";

import {
  listarModelos,
} from "../../service/modelo.service";

import {
  listarContratos,
} from "../../service/contrato.service";

import {
  listarPagamentos,
} from "../../service/pagamento.service";

export default function NotaFiscalPages() {
  const [notasFiscais, setNotasFiscais] =
    useState<INotaFiscal[]>([]);

  const [locacoes, setLocacoes] =
    useState<ILocacao[]>([]);

  const [clientes, setClientes] =
    useState<ICliente[]>([]);

  const [veiculos, setVeiculos] =
    useState<IVeiculo[]>([]);

  const [modelos, setModelos] =
    useState<IModelo[]>([]);

  const [contratos, setContratos] =
    useState<IContrato[]>([]);

  const [pagamentos, setPagamentos] =
    useState<IPagamento[]>([]);

  const [notaSelecionada, setNotaSelecionada] =
    useState<INotaFiscal | null>(null);

  const [pesquisa, setPesquisa] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [
        dadosNotas,
        dadosLocacoes,
        dadosClientes,
        dadosVeiculos,
        dadosModelos,
        dadosContratos,
        dadosPagamentos,
      ] = await Promise.all([
        listarNotasFiscais(),
        listarLocacoes(),
        listarClientes(),
        listarVeiculos(),
        listarModelos(),
        listarContratos(),
        listarPagamentos(),
      ]);

      setNotasFiscais(dadosNotas);
      setLocacoes(dadosLocacoes);
      setClientes(dadosClientes);
      setVeiculos(dadosVeiculos);
      setModelos(dadosModelos);
      setContratos(dadosContratos);
      setPagamentos(dadosPagamentos);
    } catch {
      setErro(
        "Erro ao carregar os dados das notas fiscais."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function salvarNotaFiscal(
    notaFiscal: INotaFiscal
  ) {
    setErro("");
    setMensagem("");

    try {
      const notaCriada =
        await criarNotaFiscal(notaFiscal);

      setMensagem(
        "Nota fiscal emitida com sucesso!"
      );

      await carregarDados();

      setNotaSelecionada(notaCriada);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao emitir nota fiscal."
      );

      throw error;
    }
  }

  function moeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const totalEmitido = notasFiscais.reduce(
    (soma, nota) =>
      soma + Math.round(nota.valor * 100),
    0
  ) / 100;

  const locacoesPendentes = locacoes.filter(
    (locacao) =>
      locacao.status === "FINALIZADA" &&
      !notasFiscais.some(
        (nota) =>
          nota.locacaoId === locacao.id
      )
  ).length;

  const notasFiltradas = notasFiscais
    .filter((nota) => {
      const termo =
        pesquisa.trim().toLowerCase();

      const locacao = locacoes.find(
        (item) =>
          item.id === nota.locacaoId
      );

      const cliente = clientes.find(
        (item) =>
          item.id === locacao?.clienteId
      );

      const veiculo = veiculos.find(
        (item) =>
          item.id === locacao?.veiculoId
      );

      return (
        nota.numero
          .toLowerCase()
          .includes(termo) ||
        nota.locacaoId
          .toLowerCase()
          .includes(termo) ||
        (
          cliente?.nome.toLowerCase() ?? ""
        ).includes(termo) ||
        (
          veiculo?.placa.toLowerCase() ?? ""
        ).includes(termo)
      );
    })
    .sort(
      (a, b) =>
        b.dataEmissao.localeCompare(
          a.dataEmissao
        )
    );

  const locacaoSelecionada = locacoes.find(
    (item) =>
      item.id === notaSelecionada?.locacaoId
  );

  const clienteSelecionado = clientes.find(
    (item) =>
      item.id === locacaoSelecionada?.clienteId
  );

  const veiculoSelecionado = veiculos.find(
    (item) =>
      item.id === locacaoSelecionada?.veiculoId
  );

  const modeloSelecionado = modelos.find(
    (item) =>
      item.id === veiculoSelecionado?.modeloId
  );

  const contratoSelecionado = contratos.find(
    (item) =>
      item.locacaoId === notaSelecionada?.locacaoId
  );

  const pagamentosSelecionados =
    pagamentos.filter(
      (item) =>
        item.locacaoId === notaSelecionada?.locacaoId
    );

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      <h2 className="mb-4 nao-imprimir">
        Gerenciamento de Notas Fiscais
      </h2>

      {mensagem && (
        <Alert variant="success">
          {mensagem}
        </Alert>
      )}

      {erro && (
        <Alert variant="danger">
          {erro}
        </Alert>
      )}

      {notaSelecionada ? (
        <NotaFiscalDetalhe
          notaFiscal={notaSelecionada}
          locacao={locacaoSelecionada}
          cliente={clienteSelecionado}
          veiculo={veiculoSelecionado}
          modelo={modeloSelecionado}
          contrato={contratoSelecionado}
          pagamentos={pagamentosSelecionados}
          onClose={() => {
            setNotaSelecionada(null);
            setMensagem("");
          }}
        />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <Card titulo="Notas emitidas">
                <h4 className="text-success">
                  {notasFiscais.length}
                </h4>
              </Card>
            </div>

            <div className="col-md-4">
              <Card titulo="Valor total emitido">
                <h4 className="text-success">
                  {moeda(totalEmitido)}
                </h4>
              </Card>
            </div>

            <div className="col-md-4">
              <Card titulo="Aguardando emissão">
                <h4 className="text-warning">
                  {locacoesPendentes}
                </h4>
              </Card>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-3">
              <Card titulo="Emitir nota fiscal">
                {carregando ? (
                  <p>Carregando locações...</p>
                ) : (
                  <NotaFiscalForm
                    notasFiscais={notasFiscais}
                    locacoes={locacoes}
                    clientes={clientes}
                    veiculos={veiculos}
                    onSave={salvarNotaFiscal}
                  />
                )}
              </Card>
            </div>

            <div className="col-lg-9">
              <Card titulo="Notas Fiscais Emitidas">
                <Input
                  id="pesquisaNotaFiscal"
                  label="Pesquisar nota fiscal"
                  placeholder="Número, cliente ou placa"
                  value={pesquisa}
                  onChange={(event) =>
                    setPesquisa(
                      event.target.value
                    )
                  }
                />

                {carregando ? (
                  <p>Carregando notas fiscais...</p>
                ) : (
                  <>
                    <p className="text-muted">
                      Exibindo{" "}
                      {notasFiltradas.length}
                      {" "}de{" "}
                      {notasFiscais.length}
                      {" "}notas fiscais.
                    </p>

                    <NotaFiscalTable
                      notasFiscais={notasFiltradas}
                      locacoes={locacoes}
                      clientes={clientes}
                      veiculos={veiculos}
                      onVisualizar={(nota) => {
                        setNotaSelecionada(nota);
                        setMensagem("");
                        setErro("");
                      }}
                    />
                  </>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
