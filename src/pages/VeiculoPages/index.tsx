
import { useEffect, useState } from "react";

import type { IVeiculo } from "../../models/veiculo.model";
import type { IModelo } from "../../models/modelo.model";

import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";

import VeiculoForm from "./VeiculoForm";
import VeiculoTable from "./VeiculoTable";

import {
  listarVeiculos,
  criarVeiculo,
  atualizarVeiculo,
  excluirVeiculo,
} from "../../service/veiculo.service";

import { listarModelos } from "../../service/modelo.service";

export default function VeiculoPages() {
  const [veiculos, setVeiculos] = useState<IVeiculo[]>([]);
  const [modelos, setModelos] = useState<IModelo[]>([]);

  const [veiculoEditando, setVeiculoEditando] =
    useState<IVeiculo | null>(null);

  const [veiculoExcluindo, setVeiculoExcluindo] =
    useState<string | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  async function carregarDados() {
    try {
      const [dadosVeiculos, dadosModelos] =
        await Promise.all([
          listarVeiculos(),
          listarModelos(),
        ]);

      setVeiculos(dadosVeiculos);
      setModelos(dadosModelos);
    } catch {
      setErro("Erro ao carregar os dados.");
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function salvarVeiculo(veiculo: IVeiculo) {
    setErro("");
    setMensagem("");

    try {
      if (veiculo.id) {
        await atualizarVeiculo(veiculo.id, veiculo);
        setMensagem("Veículo atualizado com sucesso!");
      } else {
        await criarVeiculo(veiculo);
        setMensagem("Veículo cadastrado com sucesso!");
      }

      setVeiculoEditando(null);
      await carregarDados();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao salvar veículo.");
      }

      throw error;
    }
  }

  function editarVeiculo(veiculo: IVeiculo) {
    setVeiculoEditando(veiculo);
    setMensagem("");
    setErro("");
  }

  function solicitarExclusao(id: string) {
    setVeiculoExcluindo(id);
    setMensagem("");
    setErro("");
  }

  async function confirmarExclusao() {
    if (!veiculoExcluindo || excluindo) {
      return;
    }

    setExcluindo(true);

    try {
      await excluirVeiculo(veiculoExcluindo);

      setMensagem("Veículo excluído com sucesso!");
      setVeiculoEditando(null);

      await carregarDados();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao excluir veículo.");
      }
    } finally {
      setVeiculoExcluindo(null);
      setExcluindo(false);
    }
  }

  function cancelarExclusao() {
    if (!excluindo) {
      setVeiculoExcluindo(null);
    }
  }

  function cancelar() {
    setVeiculoEditando(null);
    setErro("");
    setMensagem("");
  }

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      <h2 className="mb-4">Cadastro de Veículos</h2>

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
              veiculoEditando
                ? "Editar veículo"
                : "Novo veículo"
            }
          >
            <VeiculoForm
              veiculo={veiculoEditando}
              modelos={modelos}
              onSave={salvarVeiculo}
              onCancel={cancelar}
            />
          </Card>
        </div>

        <div className="col-lg-9">
          <Card
            titulo={`Veículos cadastrados (${veiculos.length})`}
          >
            <VeiculoTable
              veiculos={veiculos}
              modelos={modelos}
              onEdit={editarVeiculo}
              onDelete={solicitarExclusao}
            />
          </Card>
        </div>
      </div>

      <Modal
        aberto={veiculoExcluindo !== null}
        titulo="Confirmar exclusão"
        onClose={cancelarExclusao}
        onConfirm={confirmarExclusao}
      >
        <p>
          Deseja realmente excluir o veículo de placa{" "}
          <strong>
            {veiculos.find(
              (veiculo) => veiculo.id === veiculoExcluindo
            )?.placa}
          </strong>?
        </p>

        <p className="text-muted mb-0">
          {excluindo
            ? "Excluindo veículo..."
            : "Esta ação não poderá ser desfeita."}
        </p>
      </Modal>
    </div>
  );
}
