
export interface IContrato {
  id?: string;
  numero: string;
  dataEmissao: string;
  termos: string;
  locacaoId: string;
}

export const contratoInicial: IContrato = {
  numero: "",
  dataEmissao: "",
  termos: "",
  locacaoId: "",
};
