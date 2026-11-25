
import { useEffect, useState } from "react";

import type { IManutencao } from "../../models/manutencao.model";
import type { IVeiculo } from "../../models/veiculo.model";
import type { IModelo } from "../../models/modelo.model";

import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import Select from "../../components/Select";

import ManutencaoForm from "./ManutencaoForm";
import ManutencaoTable from "./ManutencaoTable";

import {
  listarManutencoes,
  criarManutencao,
  atualizarManutencao,
  excluirManutencao,
} from "../../service/manutencao.service";

import { listarVeiculos } from "../../service/veiculo.service";
import { listarModelos } from "../../service/modelo.service";

export default function ManutencaoPages() {
  const [manutencoes, setManutencoes] =
    useState<IManutencao[]>([]);

  const [veiculos, setVeiculos] =
    useState<IVeiculo[]>([]);

  const [modelos, setModelos] =
    useState<IModelo[]>([]);

  const [manutencaoEditando, setManutencaoEditando] =
    useState<IManutencao | null>(null);

  const [manutencaoExcluindo, setManutencaoExcluindo] =
    useState<string | null>(null);

  const [filtroVeiculo, setFiltroVeiculo] =
    useState("");

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  async function carregarDados() {
    try {
      const [
        dadosManutencoes,
        dadosVeiculos,
        dadosModelos,
      ] = await Promise.all([
        listarManutencoes(),
        listarVeiculos(),
        listarModelos(),
      ]);

      setManutencoes(dadosManutencoes);
      setVeiculos(dadosVeiculos);
      setModelos(dadosModelos);
    } catch {
      setErro("Erro ao carregar os dados.");
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function salvarManutencao(
    manutencao: IManutencao
  ) {
    setErro("");
    setMensagem("");

    try {
      if (manutencao.id) {
        await atualizarManutencao(
          manutencao.id,
          manutencao
        );

        setMensagem(
          "Manutenção atualizada com sucesso!"
        );
      } else {
        await criarManutencao(manutencao);

        setMensagem(
          "Manutenção cadastrada com sucesso!"
        );
      }

      setManutencaoEditando(null);
      await carregarDados();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao salvar manutenção.");
      }

      throw error;
    }
  }

  function editarManutencao(
    manutencao: IManutencao
  ) {
    setManutencaoEditando(manutencao);
    setMensagem("");
    setErro("");
  }

  function solicitarExclusao(id: string) {
    setManutencaoExcluindo(id);
    setMensagem("");
    setErro("");
  }

  async function confirmarExclusao() {
    if (!manutencaoExcluindo || excluindo) {
      return;
    }

    setExcluindo(true);

    try {
      await excluirManutencao(manutencaoExcluindo);

      setMensagem(
        "Manutenção excluída com sucesso!"
      );

      setManutencaoEditando(null);
      await carregarDados();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao excluir manutenção.");
      }
    } finally {
      setManutencaoExcluindo(null);
      setExcluindo(false);
    }
  }

  function cancelarExclusao() {
    if (!excluindo) {
      setManutencaoExcluindo(null);
    }
  }

  function cancelar() {
    setManutencaoEditando(null);
    setErro("");
    setMensagem("");
  }

  const manutencoesFiltradas = manutencoes
    .filter(
      (manutencao) =>
        !filtroVeiculo ||
        manutencao.veiculoId === filtroVeiculo
    )
    .sort(
      (a, b) => b.data.localeCompare(a.data)
    );

  const valorTotal = manutencoesFiltradas.reduce(
    (total, manutencao) =>
      total + manutencao.valor,
    0
  );

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      <h2 className="mb-4">
        Cadastro de Manutenções
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

      <div className="row g-4">
        <div className="col-lg-3">
          <Card
            titulo={
              manutencaoEditando
                ? "Editar manutenção"
                : "Nova manutenção"
            }
          >
            <ManutencaoForm
              manutencao={manutencaoEditando}
              veiculos={veiculos}
              modelos={modelos}
              onSave={salvarManutencao}
              onCancel={cancelar}
            />
          </Card>
        </div>

        <div className="col-lg-9">
          <Card titulo="Histórico de Manutenções">
            <Select
              id="filtroVeiculo"
              label="Filtrar por veículo (vazio = todos)"
              value={filtroVeiculo}
              onChange={(event) =>
                setFiltroVeiculo(event.target.value)
              }
              opcoes={veiculos
                .filter(
                  (veiculo) => Boolean(veiculo.id)
                )
                .map((veiculo) => ({
                  value: veiculo.id ?? "",
                  label: `${
                    modelos.find(
                      (modelo) =>
                        modelo.id === veiculo.modeloId
                    )?.nome ?? "Modelo desconhecido"
                  } - ${veiculo.placa}`,
                }))}
            />

            <div className="row mb-3">
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Manutenções:</strong>{" "}
                  {manutencoesFiltradas.length}
                </p>
              </div>

              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Valor total:</strong>{" "}
                  {valorTotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            </div>

            <ManutencaoTable
              manutencoes={manutencoesFiltradas}
              veiculos={veiculos}
              modelos={modelos}
              onEdit={editarManutencao}
              onDelete={solicitarExclusao}
            />
          </Card>
        </div>
      </div>

      <Modal
        aberto={manutencaoExcluindo !== null}
        titulo="Confirmar exclusão"
        onClose={cancelarExclusao}
        onConfirm={confirmarExclusao}
      >
        <p>
          Deseja realmente excluir esta manutenção?
        </p>

        <p className="text-muted mb-0">
          {excluindo
            ? "Excluindo manutenção..."
            : "Esta ação não poderá ser desfeita."}
        </p>
      </Modal>
    </div>
  );
}
