
import { useEffect, useState } from "react";

import type { ICliente } from "../../models/cliente.model";

import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import Input from "../../components/Input";

import ClienteForm from "./ClienteForm";
import ClienteTable from "./ClienteTable";

import {
  listarClientes,
  criarCliente,
  atualizarCliente,
  excluirCliente,
} from "../../service/cliente.service";

export default function ClientePages() {
  const [clientes, setClientes] =
    useState<ICliente[]>([]);

  const [clienteEditando, setClienteEditando] =
    useState<ICliente | null>(null);

  const [clienteExcluindo, setClienteExcluindo] =
    useState<string | null>(null);

  const [pesquisa, setPesquisa] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  async function carregarClientes() {
    try {
      const dados = await listarClientes();
      setClientes(dados);
    } catch {
      setErro("Erro ao carregar clientes.");
    }
  }

  useEffect(() => {
    const inicio = window.setTimeout(() => {
      void carregarClientes();
    }, 0);

    return () => window.clearTimeout(inicio);
  }, []);

  async function salvarCliente(cliente: ICliente) {
    setErro("");
    setMensagem("");

    try {
      if (cliente.id) {
        await atualizarCliente(cliente.id, cliente);

        setMensagem(
          "Cliente atualizado com sucesso!"
        );
      } else {
        await criarCliente(cliente);

        setMensagem(
          "Cliente cadastrado com sucesso!"
        );
      }

      setClienteEditando(null);
      setPesquisa("");
      await carregarClientes();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao salvar cliente.");
      }

      throw error;
    }
  }

  function editarCliente(cliente: ICliente) {
    setClienteEditando(cliente);
    setMensagem("");
    setErro("");
  }

  function solicitarExclusao(id: string) {
    setClienteExcluindo(id);
    setMensagem("");
    setErro("");
  }

  async function confirmarExclusao() {
    if (!clienteExcluindo || excluindo) {
      return;
    }

    setExcluindo(true);

    try {
      await excluirCliente(clienteExcluindo);

      setMensagem(
        "Cliente excluído com sucesso!"
      );

      setClienteEditando(null);
      await carregarClientes();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao excluir cliente.");
      }
    } finally {
      setClienteExcluindo(null);
      setExcluindo(false);
    }
  }

  function cancelarExclusao() {
    if (!excluindo) {
      setClienteExcluindo(null);
    }
  }

  function cancelar() {
    setClienteEditando(null);
    setErro("");
    setMensagem("");
  }

  const clientesFiltrados = clientes.filter(
    (cliente) => {
      const termo = pesquisa.trim().toLowerCase();
      const numeros = termo.replace(/\D/g, "");

      return (
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.email.toLowerCase().includes(termo) ||
        (
          numeros.length > 0 &&
          /^[\d.\-\s]+$/.test(termo) &&
          cliente.cpf
            .replace(/\D/g, "")
            .includes(numeros)
        )
      );
    }
  );

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      <h2 className="mb-4">
        Cadastro de Clientes
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
              clienteEditando
                ? "Editar cliente"
                : "Novo cliente"
            }
          >
            <ClienteForm
              cliente={clienteEditando}
              onSave={salvarCliente}
              onCancel={cancelar}
            />
          </Card>
        </div>

        <div className="col-lg-9">
          <Card
            titulo={`Clientes cadastrados (${clientes.length})`}
          >
            <Input
              id="pesquisaCliente"
              label="Pesquisar cliente"
              type="text"
              placeholder="Digite o nome, CPF ou e-mail"
              value={pesquisa}
              onChange={(event) =>
                setPesquisa(event.target.value)
              }
            />

            <p className="text-muted">
              Exibindo {clientesFiltrados.length} de{" "}
              {clientes.length} clientes.
            </p>

            <ClienteTable
              clientes={clientesFiltrados}
              onEdit={editarCliente}
              onDelete={solicitarExclusao}
            />
          </Card>
        </div>
      </div>

      <Modal
        aberto={clienteExcluindo !== null}
        titulo="Confirmar exclusão"
        onClose={cancelarExclusao}
        onConfirm={confirmarExclusao}
      >
        <p>
          Deseja realmente excluir o cliente{" "}
          <strong>
            {clientes.find(
              (cliente) =>
                cliente.id === clienteExcluindo
            )?.nome}
          </strong>?
        </p>

        <p className="text-muted mb-0">
          {excluindo
            ? "Excluindo cliente..."
            : "Esta ação não poderá ser desfeita."}
        </p>
      </Modal>
    </div>
  );
}
