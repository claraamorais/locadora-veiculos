
export interface INotaFiscal {
  id?: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  valor: number;
  locacaoId: string;
}

export const notaFiscalInicial: INotaFiscal = {
  numero: "",
  serie: "001",
  dataEmissao: "",
  valor: 0,
  locacaoId: "",
};
