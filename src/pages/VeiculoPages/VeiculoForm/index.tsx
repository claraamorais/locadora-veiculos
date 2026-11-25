
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Select from "../../../components/Select";

import type { IVeiculo } from "../../../models/veiculo.model";
import type { IModelo } from "../../../models/modelo.model";

interface VeiculoFormProps {
  veiculo?: IVeiculo | null;
  modelos: IModelo[];
  onSave: (veiculo: IVeiculo) => Promise<void>;
  onCancel: () => void;
}

interface ErrosFormulario {
  chassi?: string;
  placa?: string;
  anoFabricacao?: string;
  cor?: string;
  kmRodado?: string;
  modeloId?: string;
}

export default function VeiculoForm({
  veiculo,
  modelos,
  onSave,
  onCancel,
}: VeiculoFormProps) {
  const [chassi, setChassi] = useState("");
  const [placa, setPlaca] = useState("");
  const [anoFabricacao, setAnoFabricacao] = useState("");
  const [cor, setCor] = useState("");
  const [kmRodado, setKmRodado] = useState("");
  const [modeloId, setModeloId] = useState("");

  const [erros, setErros] = useState<ErrosFormulario>({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setChassi(veiculo?.chassi ?? "");
    setPlaca(veiculo?.placa ?? "");

    setAnoFabricacao(
      veiculo ? String(veiculo.anoFabricacao) : ""
    );

    setCor(veiculo?.cor ?? "");

    setKmRodado(
      veiculo ? String(veiculo.kmRodado) : ""
    );

    setModeloId(veiculo?.modeloId ?? "");
    setErros({});
  }, [veiculo]);

  function limparCampos() {
    setChassi("");
    setPlaca("");
    setAnoFabricacao("");
    setCor("");
    setKmRodado("");
    setModeloId("");
    setErros({});
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const novosErros: ErrosFormulario = {};

    const chassiFormatado = chassi.trim().toUpperCase();

    const placaFormatada = placa
      .trim()
      .toUpperCase()
      .replace(/-/g, "");

    const ano = Number(anoFabricacao);
    const km = Number(kmRodado);
    const anoAtual = new Date().getFullYear();

    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(chassiFormatado)) {
      novosErros.chassi =
        "O chassi deve possuir 17 caracteres válidos.";
    }

    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placaFormatada)) {
      novosErros.placa =
        "Informe uma placa válida.";
    }

    if (
      !anoFabricacao.trim() ||
      !Number.isInteger(ano) ||
      ano < 1886 ||
      ano > anoAtual
    ) {
      novosErros.anoFabricacao =
        "Informe um ano de fabricação válido.";
    }

    if (!cor.trim()) {
      novosErros.cor = "Informe a cor do veículo.";
    }

    if (
      !kmRodado.trim() ||
      !Number.isInteger(km) ||
      km < 0
    ) {
      novosErros.kmRodado =
        "Informe uma quilometragem válida.";
    }

    if (
      !modeloId ||
      !modelos.some((modelo) => modelo.id === modeloId)
    ) {
      novosErros.modeloId = "Selecione um modelo.";
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    setSalvando(true);

    try {
      await onSave({
        id: veiculo?.id,
        chassi: chassiFormatado,
        placa: placaFormatada,
        anoFabricacao: ano,
        cor: cor.trim(),
        kmRodado: km,
        modeloId,
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
        id="chassiVeiculo"
        label="Chassi"
        type="text"
        maxLength={17}
        placeholder="17 caracteres"
        value={chassi}
        onChange={(event) =>
          setChassi(event.target.value.toUpperCase())
        }
        error={erros.chassi}
      />

      <Input
        id="placaVeiculo"
        label="Placa"
        type="text"
        maxLength={8}
        placeholder="Ex.: ABC1D23"
        value={placa}
        onChange={(event) =>
          setPlaca(event.target.value.toUpperCase())
        }
        error={erros.placa}
      />

      <Input
        id="anoFabricacao"
        label="Ano de fabricação"
        type="number"
        placeholder="Ex.: 2024"
        value={anoFabricacao}
        onChange={(event) =>
          setAnoFabricacao(event.target.value)
        }
        error={erros.anoFabricacao}
      />

      <Input
        id="corVeiculo"
        label="Cor"
        type="text"
        placeholder="Ex.: Prata"
        value={cor}
        onChange={(event) =>
          setCor(event.target.value)
        }
        error={erros.cor}
      />

      <Input
        id="kmRodado"
        label="Quilometragem"
        type="number"
        min="0"
        step="1"
        placeholder="Ex.: 15000"
        value={kmRodado}
        onChange={(event) =>
          setKmRodado(event.target.value)
        }
        error={erros.kmRodado}
      />

      <Select
        id="modeloVeiculo"
        label="Modelo"
        value={modeloId}
        onChange={(event) =>
          setModeloId(event.target.value)
        }
        opcoes={modelos
          .filter((modelo) => Boolean(modelo.id))
          .map((modelo) => ({
            value: modelo.id ?? "",
            label: `${modelo.nome} - ${modelo.ano}`,
          }))}
        error={erros.modeloId}
      />

      <div className="d-flex gap-2">
        <Button
          type="submit"
          variant="success"
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : veiculo
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
