
export type StatusVeiculo =
  | "DISPONIVEL"
  | "LOCADO"
  | "EM_MANUTENCAO";

export interface IVeiculo {
  id?: string;
  chassi: string;
  placa: string;
  anoFabricacao: number;
  cor: string;
  kmRodado: number;
  modeloId: string;
}

export const veiculoInicial: IVeiculo = {
  chassi: "",
  placa: "",
  anoFabricacao: new Date().getFullYear(),
  cor: "",
  kmRodado: 0,
  modeloId: "",
};

export interface IVeiculoComStatus extends IVeiculo {
  status: StatusVeiculo;
}
