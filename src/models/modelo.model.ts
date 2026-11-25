
export interface IModelo {
  id?: string;
  nome: string;
  ano: number;
  marcaId: string;
  categoriaId: string;
}

export const modeloInicial: IModelo = {
  nome: "",
  ano: 0,
  marcaId: "",
  categoriaId: "",
};
