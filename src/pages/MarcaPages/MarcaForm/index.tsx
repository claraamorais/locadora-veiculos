import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import type { IMarca } from "../../../models/marca.model";

interface MarcaFormProps {
  marca?: IMarca | null;
  onSave: (marca: IMarca) => Promise<void>;
  onCancel: () => void;
}

export default function MarcaForm({
  marca,
  onSave,
  onCancel,
}: MarcaFormProps) {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setNome(marca?.nome ?? "");
    setErro("");
  }, [marca]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("O nome da marca é obrigatório.");
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      await onSave({
        id: marca?.id,
        nome: nome.trim(),
      });

      if (!marca) {
        setNome("");
      }
    } catch {
      setErro("Não foi possível salvar a marca.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        id="nomeMarca"
        label="Nome da marca"
        placeholder="Ex.: Honda"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        error={erro}
      />

      <div className="d-flex gap-2">
        <Button type="submit" variant="success" disabled={salvando}>
          {salvando
            ? "Salvando..."
            : marca
              ? "Salvar alterações"
              : "Cadastrar marca"}
        </Button>

        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
