
export interface ICliente {
  id?: string;
  nome: string;
  cpf: string;
  cnh: string;
  validadeCnh: string;
  telefone: string;
  email: string;
  endereco: string;
}

export const clienteInicial: ICliente = {
  nome: "",
  cpf: "",
  cnh: "",
  validadeCnh: "",
  telefone: "",
  email: "",
  endereco: "",
};
