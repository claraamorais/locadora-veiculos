
import { useState } from "react";
import type { FormEvent } from "react";

import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Select from "../../../components/Select";

import type { IModelo } from "../../../models/modelo.model";
import type { IMarca } from "../../../models/marca.model";
import type { ICategoria } from "../../../models/categoria.model";

interface ModeloFormProps {
  modelo?: IModelo | null;
  marcas: IMarca[];
  categorias: ICategoria[];
  onSave: (modelo: IModelo) => Promise<void>;
  onCancel: () => void;
}

export default function ModeloForm(props: ModeloFormProps) {
  return <ModeloFormCampos key={props.modelo?.id ?? "novo"} {...props} />;
}

function ModeloFormCampos({
  modelo,
  marcas,
  categorias,
  onSave,
  onCancel,
}: ModeloFormProps) {
  const [nome, setNome] = useState(modelo?.nome ?? "");
  const [ano, setAno] = useState(modelo ? String(modelo.ano) : "");
  const [marcaId, setMarcaId] = useState(modelo?.marcaId ?? "");
  const [categoriaId, setCategoriaId] = useState(modelo?.categoriaId ?? "");

  const [erroNome, setErroNome] = useState("");
  const [erroAno, setErroAno] = useState("");
  const [erroMarca, setErroMarca] = useState("");
  const [erroCategoria, setErroCategoria] = useState("");

  const [salvando, setSalvando] = useState(false);

  function limparErros() {
    setErroNome("");
    setErroAno("");
    setErroMarca("");
    setErroCategoria("");
  }

  function limparCampos() {
    setNome("");
    setAno("");
    setMarcaId("");
    setCategoriaId("");
    limparErros();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    limparErros();

    let valido = true;

    const anoNumerico = Number(ano);
    const anoAtual = new Date().getFullYear();

    if (!nome.trim()) {
      setErroNome("Informe o nome do modelo.");
      valido = false;
    }

    if (
      !ano.trim() ||
      !Number.isInteger(anoNumerico) ||
      anoNumerico < 1886 ||
      anoNumerico > anoAtual + 1
    ) {
      setErroAno("Informe um ano válido.");
      valido = false;
    }

    if (
      !marcaId ||
      !marcas.some((marca) => marca.id === marcaId)
    ) {
      setErroMarca("Selecione uma marca.");
      valido = false;
    }

    if (
      !categoriaId ||
      !categorias.some(
        (categoria) => categoria.id === categoriaId
      )
    ) {
      setErroCategoria("Selecione uma categoria.");
      valido = false;
    }

    if (!valido) {
      return;
    }

    setSalvando(true);

    try {
      await onSave({
        id: modelo?.id,
        nome: nome.trim(),
        ano: anoNumerico,
        marcaId,
        categoriaId,
      });

      limparCampos();
    } catch {
      // O erro será exibido pela página.
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    limparCampos();
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Input
        id="nomeModelo"
        label="Nome do modelo"
        type="text"
        placeholder="Ex.: Civic"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
        error={erroNome}
      />

      <Input
        id="anoModelo"
        label="Ano"
        type="number"
        placeholder="Ex.: 2026"
        value={ano}
        onChange={(event) => setAno(event.target.value)}
        error={erroAno}
      />

      <Select
        id="marcaModelo"
        label="Marca"
        value={marcaId}
        onChange={(event) => setMarcaId(event.target.value)}
        opcoes={marcas
          .filter((marca) => Boolean(marca.id))
          .map((marca) => ({
            value: marca.id ?? "",
            label: marca.nome,
          }))}
        error={erroMarca}
      />

      <Select
        id="categoriaModelo"
        label="Categoria"
        value={categoriaId}
        onChange={(event) =>
          setCategoriaId(event.target.value)
        }
        opcoes={categorias
          .filter((categoria) => Boolean(categoria.id))
          .map((categoria) => ({
            value: categoria.id ?? "",
            label: categoria.nome,
          }))}
        error={erroCategoria}
      />

      <div className="d-flex gap-2">
        <Button
          type="submit"
          variant="success"
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : modelo
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
