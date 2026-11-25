
import { useEffect, useState } from "react";

import type { ICategoria } from "../../models/categoria.model";

import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";

import CategoriaForm from "./CategoriaForm";
import CategoriaTable from "./CategoriaTable";

import {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria,
} from "../../service/categoria.service";

export default function CategoriaPages() {
  const [categorias, setCategorias] = useState<ICategoria[]>([]);

  const [categoriaEditando, setCategoriaEditando] =
    useState<ICategoria | null>(null);

  const [categoriaExcluindo, setCategoriaExcluindo] =
    useState<string | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  async function carregarCategorias() {
    try {
      const dados = await listarCategorias();
      setCategorias(dados);
    } catch {
      setErro("Erro ao carregar categorias.");
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  async function salvarCategoria(categoria: ICategoria) {
    setErro("");
    setMensagem("");

    try {
      if (categoria.id) {
        await atualizarCategoria(categoria.id, categoria);
        setMensagem("Categoria atualizada com sucesso!");
      } else {
        await criarCategoria(categoria);
        setMensagem("Categoria cadastrada com sucesso!");
      }

      setCategoriaEditando(null);
      await carregarCategorias();
    } catch {
      setErro("Erro ao salvar categoria.");
      throw new Error("Erro ao salvar categoria.");
    }
  }

  function editarCategoria(categoria: ICategoria) {
    setCategoriaEditando(categoria);
    setMensagem("");
    setErro("");
  }

  function solicitarExclusao(id: string) {
    setCategoriaExcluindo(id);
    setMensagem("");
    setErro("");
  }

  async function confirmarExclusao() {
    if (!categoriaExcluindo || excluindo) {
      return;
    }

    setExcluindo(true);

    try {
      await excluirCategoria(categoriaExcluindo);

      setMensagem("Categoria excluída com sucesso!");
      setCategoriaEditando(null);

      await carregarCategorias();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao excluir categoria.");
      }
    } finally {
      setCategoriaExcluindo(null);
      setExcluindo(false);
    }
  }

  function cancelarExclusao() {
    if (!excluindo) {
      setCategoriaExcluindo(null);
    }
  }

  function cancelar() {
    setCategoriaEditando(null);
    setErro("");
    setMensagem("");
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Cadastro de Categorias</h2>

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
              categoriaEditando
                ? "Editar categoria"
                : "Nova categoria"
            }
          >
            <CategoriaForm
              categoria={categoriaEditando}
              onSave={salvarCategoria}
              onCancel={cancelar}
            />
          </Card>
        </div>

        <div className="col-md-8">
          <Card
            titulo={`Categorias cadastradas (${categorias.length})`}
          >
            <CategoriaTable
              categorias={categorias}
              onEdit={editarCategoria}
              onDelete={solicitarExclusao}
            />
          </Card>
        </div>
      </div>

      <Modal
        aberto={categoriaExcluindo !== null}
        titulo="Confirmar exclusão"
        onClose={cancelarExclusao}
        onConfirm={confirmarExclusao}
      >
        <p>
          Deseja realmente excluir a categoria{" "}
          <strong>
            {categorias.find(
              (categoria) => categoria.id === categoriaExcluindo
            )?.nome}
          </strong>?
        </p>

        <p className="text-muted mb-0">
          {excluindo
            ? "Excluindo categoria..."
            : "Esta ação não poderá ser desfeita."}
        </p>
      </Modal>
    </div>
  );
}
