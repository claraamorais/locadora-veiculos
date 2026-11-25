
import { useEffect, useState } from "react";

import type { IModelo } from "../../models/modelo.model";
import type { IMarca } from "../../models/marca.model";
import type { ICategoria } from "../../models/categoria.model";

import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";

import ModeloForm from "./ModeloForm";
import ModeloTable from "./ModeloTable";

import {
  listarModelos,
  criarModelo,
  atualizarModelo,
  excluirModelo,
} from "../../service/modelo.service";

import { listarMarcas } from "../../service/marca.service";
import { listarCategorias } from "../../service/categoria.service";

export default function ModeloPages() {
  const [modelos, setModelos] = useState<IModelo[]>([]);
  const [marcas, setMarcas] = useState<IMarca[]>([]);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);

  const [modeloEditando, setModeloEditando] =
    useState<IModelo | null>(null);

  const [modeloExcluindo, setModeloExcluindo] =
    useState<string | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  async function carregarDados() {
    try {
      const [
        dadosModelos,
        dadosMarcas,
        dadosCategorias,
      ] = await Promise.all([
        listarModelos(),
        listarMarcas(),
        listarCategorias(),
      ]);

      setModelos(dadosModelos);
      setMarcas(dadosMarcas);
      setCategorias(dadosCategorias);
    } catch {
      setErro("Erro ao carregar os dados.");
    }
  }

  useEffect(() => {
    const inicio = window.setTimeout(() => {
      void carregarDados();
    }, 0);

    return () => window.clearTimeout(inicio);
  }, []);

  async function salvarModelo(modelo: IModelo) {
    setErro("");
    setMensagem("");

    try {
      if (modelo.id) {
        await atualizarModelo(modelo.id, modelo);
        setMensagem("Modelo atualizado com sucesso!");
      } else {
        await criarModelo(modelo);
        setMensagem("Modelo cadastrado com sucesso!");
      }

      setModeloEditando(null);
      await carregarDados();
    } catch {
      setErro("Erro ao salvar modelo.");
      throw new Error("Erro ao salvar modelo.");
    }
  }

  function editarModelo(modelo: IModelo) {
    setModeloEditando(modelo);
    setMensagem("");
    setErro("");
  }

  function solicitarExclusao(id: string) {
    setModeloExcluindo(id);
    setMensagem("");
    setErro("");
  }

  async function confirmarExclusao() {
    if (!modeloExcluindo || excluindo) {
      return;
    }

    setExcluindo(true);

    try {
      await excluirModelo(modeloExcluindo);

      setMensagem("Modelo excluído com sucesso!");
      setModeloEditando(null);

      await carregarDados();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao excluir modelo.");
      }
    } finally {
      setModeloExcluindo(null);
      setExcluindo(false);
    }
  }

  function cancelarExclusao() {
    if (!excluindo) {
      setModeloExcluindo(null);
    }
  }

  function cancelar() {
    setModeloEditando(null);
    setErro("");
    setMensagem("");
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Cadastro de Modelos</h2>

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
        <div className="col-md-4">
          <Card
            titulo={
              modeloEditando
                ? "Editar modelo"
                : "Novo modelo"
            }
          >
            <ModeloForm
              modelo={modeloEditando}
              marcas={marcas}
              categorias={categorias}
              onSave={salvarModelo}
              onCancel={cancelar}
            />
          </Card>
        </div>

        <div className="col-md-8">
          <Card
            titulo={`Modelos cadastrados (${modelos.length})`}
          >
            <ModeloTable
              modelos={modelos}
              marcas={marcas}
              categorias={categorias}
              onEdit={editarModelo}
              onDelete={solicitarExclusao}
            />
          </Card>
        </div>
      </div>

      <Modal
        aberto={modeloExcluindo !== null}
        titulo="Confirmar exclusão"
        onClose={cancelarExclusao}
        onConfirm={confirmarExclusao}
      >
        <p>
          Deseja realmente excluir o modelo{" "}
          <strong>
            {modelos.find(
              (modelo) => modelo.id === modeloExcluindo
            )?.nome}
          </strong>?
        </p>

        <p className="text-muted mb-0">
          {excluindo
            ? "Excluindo modelo..."
            : "Esta ação não poderá ser desfeita."}
        </p>
      </Modal>
    </div>
  );
}
