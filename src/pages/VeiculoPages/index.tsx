
import { useEffect, useState } from "react";

import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Select from "../../components/Select";
import Modal from "../../components/Modal";

import VeiculoForm from "./VeiculoForm";
import VeiculoTable from "./VeiculoTable";

import type {
  IVeiculo,
  IVeiculoComStatus,
} from "../../models/veiculo.model";

import type {
  IModelo,
} from "../../models/modelo.model";

import {
  listarVeiculosComStatus,
  criarVeiculo,
  atualizarVeiculo,
  excluirVeiculo,
} from "../../service/veiculo.service";

import {
  listarModelos,
} from "../../service/modelo.service";

export default function VeiculoPages() {
  const [veiculos, setVeiculos] =
    useState<IVeiculoComStatus[]>([]);

  const [modelos, setModelos] =
    useState<IModelo[]>([]);

  const [veiculoEditando, setVeiculoEditando] =
    useState<IVeiculo | null>(null);

  const [veiculoExcluindo, setVeiculoExcluindo] =
    useState<IVeiculo | null>(null);

  const [filtroStatus, setFiltroStatus] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [excluindo, setExcluindo] =
    useState(false);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [
        dadosVeiculos,
        dadosModelos,
      ] = await Promise.all([
        listarVeiculosComStatus(),
        listarModelos(),
      ]);

      setVeiculos(dadosVeiculos);
      setModelos(dadosModelos);
    } catch {
      setErro(
        "Erro ao carregar os veículos."
      );
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

  async function salvarVeiculo(
    veiculo: IVeiculo
  ) {
    setErro("");
    setMensagem("");

    try {
      if (veiculo.id) {
        await atualizarVeiculo(
          veiculo.id,
          veiculo
        );

        setMensagem(
          "Veículo atualizado com sucesso!"
        );
      } else {
        await criarVeiculo(veiculo);

        setMensagem(
          "Veículo cadastrado com sucesso!"
        );
      }

      setVeiculoEditando(null);
      setFiltroStatus("");

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar veículo."
      );

      throw error;
    }
  }

  async function confirmarExclusao() {
    if (!veiculoExcluindo?.id || excluindo) {
      return;
    }

    setErro("");
    setMensagem("");
    setExcluindo(true);

    try {
      await excluirVeiculo(
        veiculoExcluindo.id
      );

      setMensagem(
        "Veículo excluído com sucesso!"
      );

      setVeiculoExcluindo(null);
      setVeiculoEditando(null);

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao excluir veículo."
      );

      setVeiculoExcluindo(null);
    } finally {
      setExcluindo(false);
    }
  }

  const totalDisponiveis = veiculos.filter(
    (item) => item.status === "DISPONIVEL"
  ).length;

  const totalLocados = veiculos.filter(
    (item) => item.status === "LOCADO"
  ).length;

  const totalManutencao = veiculos.filter(
    (item) => item.status === "EM_MANUTENCAO"
  ).length;

  const veiculosFiltrados = veiculos.filter(
    (item) =>
      !filtroStatus ||
      item.status === filtroStatus
  );

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      <h2 className="mb-4">
        Gerenciamento de Veículos
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
          <Card titulo="Total de veículos">
            <h4>{veiculos.length}</h4>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Disponíveis">
            <h4 className="text-success">
              {totalDisponiveis}
            </h4>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Locados">
            <h4 className="text-primary">
              {totalLocados}
            </h4>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Em manutenção">
            <h4 className="text-warning">
              {totalManutencao}
            </h4>
          </Card>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-3">
          <Card
            titulo={
              veiculoEditando
                ? "Editar veículo"
                : "Cadastrar veículo"
            }
          >
            <VeiculoForm
              veiculo={veiculoEditando}
              modelos={modelos}
              onSave={salvarVeiculo}
              onCancel={() => {
                setVeiculoEditando(null);
                setErro("");
                setMensagem("");
              }}
            />
          </Card>
        </div>

        <div className="col-lg-9">
          <Card titulo="Veículos cadastrados">
            <div className="row">
              <div className="col-md-6">
                <Select
                  id="filtroStatusVeiculo"
                  label="Filtrar por disponibilidade"
                  value={filtroStatus}
                  onChange={(event) =>
                    setFiltroStatus(
                      event.target.value
                    )
                  }
                  opcoes={[
                    {
                      value: "DISPONIVEL",
                      label: "Disponível",
                    },
                    {
                      value: "LOCADO",
                      label: "Locado",
                    },
                    {
                      value: "EM_MANUTENCAO",
                      label: "Em manutenção",
                    },
                  ]}
                />
              </div>
            </div>

            {carregando ? (
              <p>Carregando veículos...</p>
            ) : (
              <>
                <p className="text-muted">
                  Exibindo{" "}
                  {veiculosFiltrados.length}
                  {" "}de{" "}
                  {veiculos.length}
                  {" "}veículos.
                </p>

                <VeiculoTable
                  veiculos={veiculosFiltrados}
                  modelos={modelos}
                  onEdit={(veiculo) => {
                    const {
                      id,
                      chassi,
                      placa,
                      anoFabricacao,
                      cor,
                      kmRodado,
                      modeloId,
                    } = veiculo;

                    setVeiculoEditando({
                      id,
                      chassi,
                      placa,
                      anoFabricacao,
                      cor,
                      kmRodado,
                      modeloId,
                    });

                    setErro("");
                    setMensagem("");
                  }}
                  onDelete={(veiculo) =>
                    setVeiculoExcluindo(veiculo)
                  }
                />
              </>
            )}
          </Card>
        </div>
      </div>

      <Modal
        aberto={!!veiculoExcluindo}
        titulo="Excluir veículo"
        onClose={() => {
          if (!excluindo) {
            setVeiculoExcluindo(null);
          }
        }}
        onConfirm={confirmarExclusao}
      >
        <p>
          Deseja realmente excluir o veículo
          de placa{" "}
          <strong>
            {veiculoExcluindo?.placa}
          </strong>
          ?
        </p>

        {excluindo && (
          <p>Excluindo veículo...</p>
        )}
      </Modal>
    </div>
  );
}
