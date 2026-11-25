
export type FormaPagamento =
  | "PIX"
  | "DINHEIRO"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "TRANSFERENCIA";

export type StatusPagamento =
  | "PENDENTE"
  | "CONFIRMADO"
  | "CANCELADO";

export interface IPagamento {
  id?: string;
  data: string;
  valor: number;
  forma: FormaPagamento;
  status: StatusPagamento;
  locacaoId: string;
}

export const pagamentoInicial: IPagamento = {
  data: "",
  valor: 0,
  forma: "PIX",
  status: "PENDENTE",
  locacaoId: "",
};

export function calcularTotalPago(
  pagamentos: IPagamento[]
): number {
  const total = pagamentos
    .filter(
      (pagamento) =>
        pagamento.status === "CONFIRMADO"
    )
    .reduce(
      (soma, pagamento) =>
        soma + Math.round(pagamento.valor * 100),
      0
    );

  return total / 100;
}

export function calcularSaldo(
  valorTotal: number,
  pagamentos: IPagamento[]
): number {
  return Number(
    (
      valorTotal - calcularTotalPago(pagamentos)
    ).toFixed(2)
  );
}

export function formatarFormaPagamento(
  forma: FormaPagamento
): string {
  const formas: Record<FormaPagamento, string> = {
    PIX: "Pix",
    DINHEIRO: "Dinheiro",
    CARTAO_CREDITO: "Cartão de crédito",
    CARTAO_DEBITO: "Cartão de débito",
    TRANSFERENCIA: "Transferência bancária",
  };

  return formas[forma];
}
