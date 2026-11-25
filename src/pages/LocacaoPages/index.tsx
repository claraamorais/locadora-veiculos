
import { useEffect, useState } from "react";

import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Select from "../../components/Select";
import Modal from "../../components/Modal";

import LocacaoForm from "./LocacaoForm";
import LocacaoTable from "./LocacaoTable";

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
  ICategoria,
} from "../../models/categoria.model";

import {
  listarLocacoes,
  listarVeiculosDisponiveis,
  criarLocacao,
  atualizarLocacao,
  cancelarLocacao,
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
  listarCategorias,
} from "../../service/categoria.service";

export default function LocacaoPages() {
  const [locacoes, setLocacoes] =
    useState<ILocacao[]>([]);

  const [clientes, setClientes] =
    useState<ICliente[]>([]);

  const [veiculos, setVeiculos] =
    useState<IVeiculo[]>([]);

  const [disponiveis, setDisponiveis] =
    useState<IVeiculo[]>([]);

  const [modelos, setModelos] =
    useState<IModelo[]>([]);

  const [categorias, setCategorias] =
    useState<ICategoria[]>([]);

  const [locacaoEditando, setLocacaoEditando] =
    useState<ILocacao | null>(null);

  const [
    locacaoCancelando,
    setLocacaoCancelando,
  ] = useState<string | null>(null);

  const [filtroStatus, setFiltroStatus] =
    useState("");

  const [filtroCliente, setFiltroCliente] =
    useState("");

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [cancelando, setCancelando] =
    useState(false);

  async function carregarDados() {
    try {
      const [
        dadosLocacoes,
        dadosClientes,
        dadosVeiculos,
        dadosDisponiveis,
        dadosModelos,
        dadosCategorias,
      ] = await Promise.all([
        listarLocacoes(),
        listarClientes(),
        listarVeiculos(),
        listarVeiculosDisponiveis(),
        listarModelos(),
        listarCategorias(),
      ]);

      setLocacoes(dadosLocacoes);
      setClientes(dadosClientes);
      setVeiculos(dadosVeiculos);
      setDisponiveis(dadosDisponiveis);
      setModelos(dadosModelos);
      setCategorias(dadosCategorias);
    } catch {
      setErro(
        "Erro ao carregar os dados de locações."
      );
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function salvarLocacao(
    locacao: ILocacao
  ) {
    setErro("");
    setMensagem("");

    try {
      if (locacao.id) {
        await atualizarLocacao(
          locacao.id,
          locacao
        );

        setMensagem(
          "Locação atualizada com sucesso!"
        );
      } else {
        await criarLocacao(locacao);

        setMensagem(
          "Locação registrada e contrato gerado com sucesso!"
        );
      }

      setLocacaoEditando(null);
      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao registrar locação."
      );

      throw error;
    }
  }

  function editarLocacao(locacao: ILocacao) {
    setLocacaoEditando(locacao);
    setErro("");
    setMensagem("");
  }

  function cancelarEdicao() {
    setLocacaoEditando(null);
    setErro("");
    setMensagem("");
  }

  function solicitarCancelamento(id: string) {
    setLocacaoCancelando(id);
    setErro("");
    setMensagem("");
  }

  async function confirmarCancelamento() {
    if (!locacaoCancelando || cancelando) {
      return;
    }

    setCancelando(true);

    try {
      await cancelarLocacao(
        locacaoCancelando
      );

      setMensagem(
        "Locação cancelada com sucesso!"
      );

      setLocacaoEditando(null);
      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao cancelar locação."
      );
    } finally {
      setLocacaoCancelando(null);
      setCancelando(false);
    }
  }

  const veiculosFormulario =
    locacaoEditando
      ? veiculos.filter(
          (veiculo) =>
            veiculo.id ===
            locacaoEditando.veiculoId
        )
      : disponiveis;

  const locacoesFiltradas = locacoes.filter(
    (locacao) =>
      (
        !filtroStatus ||
        locacao.status === filtroStatus
      ) &&
      (
        !filtroCliente ||
        locacao.clienteId === filtroCliente
      )
  );

  const abertas = locacoes.filter(
    (item) => item.status === "ABERTA"
  ).length;

  const finalizadas = locacoes.filter(
    (item) => item.status === "FINALIZADA"
  ).length;

  const canceladas = locacoes.filter(
    (item) => item.status === "CANCELADA"
  ).length;

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      <h2 className="mb-4">
        Gerenciamento de Locações
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

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <Card titulo="Total de locações">
            <h3>{locacoes.length}</h3>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Abertas">
            <h3 className="text-primary">
              {abertas}
            </h3>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Finalizadas">
            <h3 className="text-success">
              {finalizadas}
            </h3>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Canceladas">
            <h3 className="text-danger">
              {canceladas}
            </h3>
          </Card>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-3">
          <Card
            titulo={
              locacaoEditando
                ? "Editar locação"
                : "Nova locação"
            }
          >
            <LocacaoForm
              locacao={locacaoEditando}
              clientes={clientes}
              veiculos={veiculosFormulario}
              modelos={modelos}
              categorias={categorias}
              onSave={salvarLocacao}
              onCancel={cancelarEdicao}
            />
          </Card>
        </div>

        <div className="col-lg-9">
          <Card titulo="Locações registradas">
            <div className="row">
              <div className="col-md-6">
                <Select
                  id="filtroStatus"
                  label="Filtrar por status"
                  value={filtroStatus}
                  onChange={(event) =>
                    setFiltroStatus(
                      event.target.value
                    )
                  }
                  opcoes={[
                    {
                      value: "ABERTA",
                      label: "Aberta",
                    },
                    {
                      value: "FINALIZADA",
                      label: "Finalizada",
                    },
                    {
                      value: "CANCELADA",
                      label: "Cancelada",
                    },
                  ]}
                />
              </div>

              <div className="col-md-6">
                <Select
                  id="filtroCliente"
                  label="Filtrar por cliente"
                  value={filtroCliente}
                  onChange={(event) =>
                    setFiltroCliente(
                      event.target.value
                    )
                  }
                  opcoes={clientes.map(
                    (cliente) => ({
                      value: cliente.id ?? "",
                      label: cliente.nome,
                    })
                  )}
                />
              </div>
            </div>

            <p className="text-muted">
              Exibindo {locacoesFiltradas.length}
              {" "}de {locacoes.length} locações.
            </p>

            <LocacaoTable
              locacoes={locacoesFiltradas}
              clientes={clientes}
              veiculos={veiculos}
              modelos={modelos}
              onEdit={editarLocacao}
              onCancel={solicitarCancelamento}
            />
          </Card>
        </div>
      </div>

      <Modal
        aberto={locacaoCancelando !== null}
        titulo="Confirmar cancelamento"
        onClose={() => {
          if (!cancelando) {
            setLocacaoCancelando(null);
          }
        }}
        onConfirm={confirmarCancelamento}
      >
        <p>
          Deseja realmente cancelar esta locação?
        </p>

        <p className="text-muted">
          O histórico será mantido e o veículo
          ficará disponível para novas locações,
          caso não esteja em manutenção.
        </p>

        {cancelando && (
          <p>Cancelando locação...</p>
        )}
      </Modal>
    </div>
  );
}
