
export interface ICategoria {
  id?: string;
  nome: string;
  valorLocacao: number;
}

export const categoriaInicial: ICategoria = {
  nome: "",
  valorLocacao: 0,
};
