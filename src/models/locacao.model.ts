
export type StatusLocacao =
  | "ABERTA"
  | "FINALIZADA"
  | "CANCELADA";

export interface ILocacao {
  id?: string;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal?: string;
  kmRetirada: number;
  kmDevolucao?: number;
  valorTotal: number;
  status: StatusLocacao;
  clienteId: string;
  veiculoId: string;
}

export const locacaoInicial: ILocacao = {
  dataRetirada: "",
  dataDevolucaoPrevista: "",
  kmRetirada: 0,
  valorTotal: 0,
  status: "ABERTA",
  clienteId: "",
  veiculoId: "",
};

export function calcularDiarias(
  retirada: string,
  devolucao: string
): number {
  const inicio = Date.parse(retirada);
  const fim = Date.parse(devolucao);

  if (
    !Number.isFinite(inicio) ||
    !Number.isFinite(fim) ||
    fim <= inicio
  ) {
    return 0;
  }

  return Math.ceil(
    (fim - inicio) / (1000 * 60 * 60 * 24)
  );
}

export function calcularValorLocacao(
  retirada: string,
  devolucao: string,
  valorDiaria: number
): number {
  const diarias = calcularDiarias(
    retirada,
    devolucao
  );

  return Number(
    (diarias * valorDiaria).toFixed(2)
  );
}

export function dataHoje(): string {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(
    hoje.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    hoje.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}
