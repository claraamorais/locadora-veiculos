
import { useEffect, useState } from "react";

import Card from "../../components/Card";
import Input from "../../components/Input";
import Alert from "../../components/Alert";

import ContratoTable from "./ContratoTable";
import ContratoDetalhe from "./ContratoDetalhe";

import type { IContrato } from "../../models/contrato.model";
import type { ILocacao } from "../../models/locacao.model";
import type { ICliente } from "../../models/cliente.model";
import type { IVeiculo } from "../../models/veiculo.model";
import type { IModelo } from "../../models/modelo.model";
import type { ICategoria } from "../../models/categoria.model";

import { listarContratos } from "../../service/contrato.service";
import { listarLocacoes } from "../../service/locacao.service";
import { listarClientes } from "../../service/cliente.service";
import { listarVeiculos } from "../../service/veiculo.service";
import { listarModelos } from "../../service/modelo.service";
import { listarCategorias } from "../../service/categoria.service";

export default function ContratoPages() {
  const [contratos, setContratos] =
    useState<IContrato[]>([]);

  const [locacoes, setLocacoes] =
    useState<ILocacao[]>([]);

  const [clientes, setClientes] =
    useState<ICliente[]>([]);

  const [veiculos, setVeiculos] =
    useState<IVeiculo[]>([]);

  const [modelos, setModelos] =
    useState<IModelo[]>([]);

  const [categorias, setCategorias] =
    useState<ICategoria[]>([]);

  const [contratoSelecionado, setContratoSelecionado] =
    useState<IContrato | null>(null);

  const [pesquisa, setPesquisa] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [
        dadosContratos,
        dadosLocacoes,
        dadosClientes,
        dadosVeiculos,
        dadosModelos,
        dadosCategorias,
      ] = await Promise.all([
        listarContratos(),
        listarLocacoes(),
        listarClientes(),
        listarVeiculos(),
        listarModelos(),
        listarCategorias(),
      ]);

      setContratos(dadosContratos);
      setLocacoes(dadosLocacoes);
      setClientes(dadosClientes);
      setVeiculos(dadosVeiculos);
      setModelos(dadosModelos);
      setCategorias(dadosCategorias);
    } catch {
      setErro("Erro ao carregar os contratos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const inicio = window.setTimeout(() => {
      void carregarDados();
    }, 0);

    return () => window.clearTimeout(inicio);
  }, []);

  const contratosFiltrados = contratos.filter(
    (contrato) => {
      const termo = pesquisa.trim().toLowerCase();

      const locacao = locacoes.find(
        (item) => item.id === contrato.locacaoId
      );

      const cliente = clientes.find(
        (item) => item.id === locacao?.clienteId
      );

      const veiculo = veiculos.find(
        (item) => item.id === locacao?.veiculoId
      );

      return (
        contrato.numero.toLowerCase().includes(termo) ||
        (cliente?.nome ?? "")
          .toLowerCase()
          .includes(termo) ||
        (veiculo?.placa ?? "")
          .toLowerCase()
          .includes(termo)
      );
    }
  );

  const locacaoSelecionada = locacoes.find(
    (locacao) =>
      locacao.id === contratoSelecionado?.locacaoId
  );

  const clienteSelecionado = clientes.find(
    (cliente) =>
      cliente.id === locacaoSelecionada?.clienteId
  );

  const veiculoSelecionado = veiculos.find(
    (veiculo) =>
      veiculo.id === locacaoSelecionada?.veiculoId
  );

  const modeloSelecionado = modelos.find(
    (modelo) =>
      modelo.id === veiculoSelecionado?.modeloId
  );

  const categoriaSelecionada = categorias.find(
    (categoria) =>
      categoria.id === modeloSelecionado?.categoriaId
  );

  const contratosAbertos = contratos.filter(
    (contrato) =>
      locacoes.some(
        (locacao) =>
          locacao.id === contrato.locacaoId &&
          locacao.status === "ABERTA"
      )
  ).length;

  const contratosFinalizados = contratos.filter(
    (contrato) =>
      locacoes.some(
        (locacao) =>
          locacao.id === contrato.locacaoId &&
          locacao.status === "FINALIZADA"
      )
  ).length;

  const contratosCancelados = contratos.filter(
    (contrato) =>
      locacoes.some(
        (locacao) =>
          locacao.id === contrato.locacaoId &&
          locacao.status === "CANCELADA"
      )
  ).length;

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      <h2 className="mb-4">
        Gerenciamento de Contratos
      </h2>

      <Alert variant="info">
        Os contratos são gerados automaticamente
        ao registrar uma locação.
      </Alert>

      {erro && (
        <Alert variant="danger">
          {erro}
        </Alert>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <Card titulo="Total de contratos">
            <h3>{contratos.length}</h3>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Locações abertas">
            <h3 className="text-primary">
              {contratosAbertos}
            </h3>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Locações finalizadas">
            <h3 className="text-success">
              {contratosFinalizados}
            </h3>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Locações canceladas">
            <h3 className="text-danger">
              {contratosCancelados}
            </h3>
          </Card>
        </div>
      </div>

      <Card titulo="Contratos registrados">
        <Input
          id="pesquisaContrato"
          label="Pesquisar contrato"
          type="text"
          placeholder="Digite o número, cliente ou placa"
          value={pesquisa}
          onChange={(event) =>
            setPesquisa(event.target.value)
          }
        />

        {carregando ? (
          <p>Carregando contratos...</p>
        ) : (
          <>
            <p className="text-muted">
              Exibindo {contratosFiltrados.length}
              {" "}de {contratos.length} contratos.
            </p>

            <ContratoTable
              contratos={contratosFiltrados}
              locacoes={locacoes}
              clientes={clientes}
              veiculos={veiculos}
              modelos={modelos}
              onVisualizar={setContratoSelecionado}
            />
          </>
        )}
      </Card>

      {contratoSelecionado && (
        <ContratoDetalhe
          contrato={contratoSelecionado}
          locacao={locacaoSelecionada}
          cliente={clienteSelecionado}
          veiculo={veiculoSelecionado}
          modelo={modeloSelecionado}
          categoria={categoriaSelecionada}
          onClose={() => setContratoSelecionado(null)}
        />
      )}
    </div>
  );
}
