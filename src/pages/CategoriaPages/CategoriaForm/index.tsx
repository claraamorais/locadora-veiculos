
import { useState } from "react";
import type { FormEvent } from "react";

import Button from "../../../components/Button";
import Input from "../../../components/Input";

import type { ICategoria } from "../../../models/categoria.model";

interface CategoriaFormProps {
  categoria?: ICategoria | null;
  onSave: (categoria: ICategoria) => Promise<void>;
  onCancel: () => void;
}

export default function CategoriaForm(props: CategoriaFormProps) {
  return <CategoriaFormCampos key={props.categoria?.id ?? "novo"} {...props} />;
}

function CategoriaFormCampos({
  categoria,
  onSave,
  onCancel,
}: CategoriaFormProps) {
  const [nome, setNome] = useState(categoria?.nome ?? "");
  const [valorLocacao, setValorLocacao] = useState(categoria ? String(categoria.valorLocacao) : "");

  const [erroNome, setErroNome] = useState("");
  const [erroValor, setErroValor] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErroNome("");
    setErroValor("");

    let valido = true;

    if (!nome.trim()) {
      setErroNome("Informe o nome da categoria.");
      valido = false;
    }

    const valor = Number(valorLocacao);

    if (
      !valorLocacao.trim() ||
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      setErroValor("Informe um valor maior que zero.");
      valido = false;
    }

    if (!valido) {
      return;
    }

    setSalvando(true);

    try {
      await onSave({
        id: categoria?.id,
        nome: nome.trim(),
        valorLocacao: valor,
      });

      setNome("");
      setValorLocacao("");
    } catch {
      // O erro será exibido pela página.
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    setNome("");
    setValorLocacao("");
    setErroNome("");
    setErroValor("");

    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Input
        id="nomeCategoria"
        label="Nome da categoria"
        type="text"
        placeholder="Ex.: Executivo"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
        error={erroNome}
      />

      <Input
        id="valorLocacao"
        label="Valor da diária (R$)"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="0,00"
        value={valorLocacao}
        onChange={(event) =>
          setValorLocacao(event.target.value)
        }
        error={erroValor}
      />

      <div className="d-flex gap-2">
        <Button
          type="submit"
          variant="success"
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : categoria
              ? "Atualizar"
              : "Cadastrar"}
        </Button>

        <Button
          variant="secondary"
          onClick={cancelar}
          disabled={salvando}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
