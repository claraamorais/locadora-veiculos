
import { useEffect, useState } from "react";

import type { IMarca } from "../../models/marca.model";

import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";

import MarcaForm from "./MarcaForm";
import MarcaTable from "./MarcaTable";

import {
  listarMarcas,
  criarMarca,
  atualizarMarca,
  excluirMarca,
} from "../../service/marca.service";

export default function MarcaPages() {
  const [marcas, setMarcas] = useState<IMarca[]>([]);
  const [marcaEditando, setMarcaEditando] = useState<IMarca | null>(null);
  const [marcaExcluindo, setMarcaExcluindo] = useState<string | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  async function carregarMarcas() {
    try {
      const dados = await listarMarcas();
      setMarcas(dados);
    } catch {
      setErro("Erro ao carregar marcas.");
    }
  }

  useEffect(() => {
    const inicio = window.setTimeout(() => {
      void carregarMarcas();
    }, 0);

    return () => window.clearTimeout(inicio);
  }, []);

  async function salvarMarca(marca: IMarca) {
    setErro("");
    setMensagem("");

    try {
      if (marca.id) {
        await atualizarMarca(marca.id, marca);
        setMensagem("Marca atualizada com sucesso!");
      } else {
        await criarMarca(marca);
        setMensagem("Marca cadastrada com sucesso!");
      }

      setMarcaEditando(null);
      await carregarMarcas();
    } catch {
      setErro("Erro ao salvar marca.");
      throw new Error("Erro ao salvar marca.");
    }
  }

  function editarMarca(marca: IMarca) {
    setMarcaEditando(marca);
    setMensagem("");
    setErro("");
  }

  function solicitarExclusao(id: string) {
    setMarcaExcluindo(id);
    setMensagem("");
    setErro("");
  }

  async function confirmarExclusao() {
    if (!marcaExcluindo || excluindo) {
      return;
    }

    setExcluindo(true);

    try {
      await excluirMarca(marcaExcluindo);

      setMensagem("Marca excluída com sucesso!");
      setMarcaEditando(null);

      await carregarMarcas();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao excluir marca.");
      }
    } finally {
      setMarcaExcluindo(null);
      setExcluindo(false);
    }
  }

  function cancelarExclusao() {
    if (!excluindo) {
      setMarcaExcluindo(null);
    }
  }

  function cancelar() {
    setMarcaEditando(null);
    setMensagem("");
    setErro("");
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Cadastro de Marcas</h2>

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
            titulo={marcaEditando ? "Editar marca" : "Nova marca"}
          >
            <MarcaForm
              marca={marcaEditando}
              onSave={salvarMarca}
              onCancel={cancelar}
            />
          </Card>
        </div>

        <div className="col-md-8">
          <Card titulo={`Marcas cadastradas (${marcas.length})`}>
            <MarcaTable
              marcas={marcas}
              onEdit={editarMarca}
              onDelete={solicitarExclusao}
            />
          </Card>
        </div>
      </div>

      <Modal
        aberto={marcaExcluindo !== null}
        titulo="Confirmar exclusão"
        onClose={cancelarExclusao}
        onConfirm={confirmarExclusao}
      >
        <p>
          Deseja realmente excluir a marca{" "}
          <strong>
            {marcas.find(
              (marca) => marca.id === marcaExcluindo
            )?.nome}
          </strong>?
        </p>

        <p className="text-muted mb-0">
          {excluindo
            ? "Excluindo marca..."
            : "Esta ação não poderá ser desfeita."}
        </p>
      </Modal>
    </div>
  );
}
