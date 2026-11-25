
export interface IManutencao {
  id?: string;
  veiculoId: string;
  data: string;
  descricao: string;
  valor: number;
  status: "EM_ANDAMENTO" | "CONCLUIDA";
}

export const manutencaoInicial: IManutencao = {
  veiculoId: "",
  data: "",
  descricao: "",
  valor: 0,
  status: "EM_ANDAMENTO",
};
