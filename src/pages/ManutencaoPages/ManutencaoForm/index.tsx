
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import TextArea from "../../../components/TextArea";

import type { IManutencao } from "../../../models/manutencao.model";
import type { IVeiculo } from "../../../models/veiculo.model";
import type { IModelo } from "../../../models/modelo.model";

interface ManutencaoFormProps {
  manutencao?: IManutencao | null;
  veiculos: IVeiculo[];
  modelos: IModelo[];
  onSave: (manutencao: IManutencao) => Promise<void>;
  onCancel: () => void;
}

interface ErrosFormulario {
  veiculoId?: string;
  data?: string;
  descricao?: string;
  valor?: string;
}

export default function ManutencaoForm({
  manutencao,
  veiculos,
  modelos,
  onSave,
  onCancel,
}: ManutencaoFormProps) {
  const [veiculoId, setVeiculoId] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const [status, setStatus] =
    useState<IManutencao["status"]>("EM_ANDAMENTO");

  const [erros, setErros] =
    useState<ErrosFormulario>({});

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setVeiculoId(manutencao?.veiculoId ?? "");
    setData(manutencao?.data ?? "");
    setDescricao(manutencao?.descricao ?? "");

    setValor(
      manutencao ? String(manutencao.valor) : ""
    );

    setStatus(
      manutencao?.status ?? "EM_ANDAMENTO"
    );

    setErros({});
  }, [manutencao]);

  function limparCampos() {
    setVeiculoId("");
    setData("");
    setDescricao("");
    setValor("");
    setStatus("EM_ANDAMENTO");
    setErros({});
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const novosErros: ErrosFormulario = {};
    const valorNumerico = Number(valor);

    if (
      !veiculoId ||
      !veiculos.some(
        (veiculo) => veiculo.id === veiculoId
      )
    ) {
      novosErros.veiculoId = "Selecione um veículo.";
    }

    if (!data) {
      novosErros.data = "Informe a data da manutenção.";
    }

    if (!descricao.trim()) {
      novosErros.descricao =
        "Informe a descrição da manutenção.";
    }

    if (
      !valor.trim() ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico < 0
    ) {
      novosErros.valor = "Informe um valor válido.";
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    setSalvando(true);

    try {
      await onSave({
        id: manutencao?.id,
        veiculoId,
        data,
        descricao: descricao.trim(),
        valor: valorNumerico,
        status,
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
      <Select
        id="veiculoManutencao"
        label="Veículo"
        value={veiculoId}
        onChange={(event) =>
          setVeiculoId(event.target.value)
        }
        opcoes={veiculos
          .filter((veiculo) => Boolean(veiculo.id))
          .map((veiculo) => ({
            value: veiculo.id ?? "",
            label: `${
              modelos.find(
                (modelo) =>
                  modelo.id === veiculo.modeloId
              )?.nome ?? "Modelo não encontrado"
            } - ${veiculo.placa}`,
          }))}
        error={erros.veiculoId}
      />

      <Input
        id="dataManutencao"
        label="Data da manutenção"
        type="date"
        value={data}
        onChange={(event) =>
          setData(event.target.value)
        }
        error={erros.data}
      />

      <TextArea
        id="descricaoManutencao"
        label="Descrição"
        rows={4}
        placeholder="Descreva os serviços realizados..."
        value={descricao}
        onChange={(event) =>
          setDescricao(event.target.value)
        }
        error={erros.descricao}
      />

      <Input
        id="valorManutencao"
        label="Valor da manutenção (R$)"
        type="number"
        min="0"
        step="0.01"
        value={valor}
        onChange={(event) =>
          setValor(event.target.value)
        }
        error={erros.valor}
      />

      <Select
        id="statusManutencao"
        label="Status"
        value={status}
        onChange={(event) =>
          setStatus(
            event.target.value === "CONCLUIDA"
              ? "CONCLUIDA"
              : "EM_ANDAMENTO"
          )
        }
        opcoes={[
          {
            value: "EM_ANDAMENTO",
            label: "Em andamento",
          },
          {
            value: "CONCLUIDA",
            label: "Concluída",
          },
        ]}
      />

      <div className="d-flex gap-2">
        <Button
          type="submit"
          variant="success"
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : manutencao
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
