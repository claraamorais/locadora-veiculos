
import type { ICliente } from "../models/cliente.model";
import { request, remover } from "./api.service";

export async function listarClientes(): Promise<ICliente[]> {
  return request<ICliente[]>("clientes");
}

export async function buscarClientePorId(
  id: string
): Promise<ICliente> {
  return request<ICliente>(`clientes/${id}`);
}

async function validarDuplicidade(
  cliente: ICliente,
  id?: string
): Promise<void> {
  const clientes = await listarClientes();

  const cpfDuplicado = clientes.some(
    (item) =>
      item.id !== id &&
      item.cpf.replace(/\D/g, "") ===
        cliente.cpf.replace(/\D/g, "")
  );

  if (cpfDuplicado) {
    throw new Error("Já existe um cliente com esse CPF.");
  }

  const cnhDuplicada = clientes.some(
    (item) =>
      item.id !== id &&
      item.cnh.replace(/\D/g, "") ===
        cliente.cnh.replace(/\D/g, "")
  );

  if (cnhDuplicada) {
    throw new Error("Já existe um cliente com essa CNH.");
  }
}

export async function criarCliente(
  cliente: ICliente
): Promise<ICliente> {
  await validarDuplicidade(cliente);

  return request<ICliente>("clientes", {
    method: "POST",
    body: JSON.stringify(cliente),
  });
}

export async function atualizarCliente(
  id: string,
  cliente: ICliente
): Promise<ICliente> {
  await validarDuplicidade(cliente, id);

  return request<ICliente>(`clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...cliente,
      id,
    }),
  });
}

export async function excluirCliente(
  id: string
): Promise<void> {
  const locacoes = await request<
    { id: string; clienteId: string | null }[]
  >("locacoes");

  const possuiLocacoes = locacoes.some(
    (locacao) => locacao.clienteId === id
  );

  if (possuiLocacoes) {
    throw new Error(
      "Não é possível excluir um cliente que possui locações cadastradas."
    );
  }

  await remover(`clientes/${id}`);
}
