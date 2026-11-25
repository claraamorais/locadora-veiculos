
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import Button from "../../../components/Button";
import Input from "../../../components/Input";
import TextArea from "../../../components/TextArea";

import type { ICliente } from "../../../models/cliente.model";

interface ClienteFormProps {
  cliente?: ICliente | null;
  onSave: (cliente: ICliente) => Promise<void>;
  onCancel: () => void;
}

interface ErrosFormulario {
  nome?: string;
  cpf?: string;
  cnh?: string;
  validadeCnh?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

export default function ClienteForm({
  cliente,
  onSave,
  onCancel,
}: ClienteFormProps) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnh, setCnh] = useState("");
  const [validadeCnh, setValidadeCnh] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");

  const [erros, setErros] =
    useState<ErrosFormulario>({});

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setNome(cliente?.nome ?? "");
    setCpf(cliente?.cpf ?? "");
    setCnh(cliente?.cnh ?? "");
    setValidadeCnh(cliente?.validadeCnh ?? "");
    setTelefone(cliente?.telefone ?? "");
    setEmail(cliente?.email ?? "");
    setEndereco(cliente?.endereco ?? "");
    setErros({});
  }, [cliente]);

  function limparCampos() {
    setNome("");
    setCpf("");
    setCnh("");
    setValidadeCnh("");
    setTelefone("");
    setEmail("");
    setEndereco("");
    setErros({});
  }

  function validarCpf(cpf: string): boolean {
    if (
      cpf.length !== 11 ||
      /^(\d)\1{10}$/.test(cpf)
    ) {
      return false;
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
      soma += Number(cpf[i]) * (10 - i);
    }

    let digito = (soma * 10) % 11;

    if (digito === 10) {
      digito = 0;
    }

    if (digito !== Number(cpf[9])) {
      return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
      soma += Number(cpf[i]) * (11 - i);
    }

    digito = (soma * 10) % 11;

    if (digito === 10) {
      digito = 0;
    }

    return digito === Number(cpf[10]);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const novosErros: ErrosFormulario = {};

    const cpfFormatado = cpf.replace(/\D/g, "");
    const cnhFormatada = cnh.replace(/\D/g, "");
    const telefoneFormatado = telefone.replace(/\D/g, "");

    if (nome.trim().length < 3) {
      novosErros.nome =
        "Informe um nome com pelo menos 3 caracteres.";
    }

    if (!validarCpf(cpfFormatado)) {
      novosErros.cpf = "Informe um CPF válido.";
    }

    if (
      cnhFormatada.length !== 11 ||
      /^(\d)\1{10}$/.test(cnhFormatada)
    ) {
      novosErros.cnh =
        "Informe uma CNH com 11 dígitos válidos.";
    }

    if (
      !validadeCnh ||
      !Number.isFinite(Date.parse(validadeCnh))
    ) {
      novosErros.validadeCnh =
        "Informe a validade da CNH.";
    }

    if (
      telefoneFormatado.length !== 10 &&
      telefoneFormatado.length !== 11
    ) {
      novosErros.telefone =
        "Informe um telefone válido com DDD.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      novosErros.email = "Informe um e-mail válido.";
    }

    if (!endereco.trim()) {
      novosErros.endereco = "Informe o endereço.";
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    setSalvando(true);

    try {
      await onSave({
        id: cliente?.id,
        nome: nome.trim(),
        cpf: cpfFormatado,
        cnh: cnhFormatada,
        validadeCnh,
        telefone: telefoneFormatado,
        email: email.trim().toLowerCase(),
        endereco: endereco.trim(),
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
        id="nomeCliente"
        label="Nome completo"
        type="text"
        placeholder="Ex.: Ana Silva"
        value={nome}
        onChange={(event) =>
          setNome(event.target.value)
        }
        error={erros.nome}
      />

      <Input
        id="cpfCliente"
        label="CPF"
        type="text"
        maxLength={14}
        placeholder="000.000.000-00"
        value={cpf}
        onChange={(event) =>
          setCpf(event.target.value)
        }
        error={erros.cpf}
      />

      <Input
        id="cnhCliente"
        label="CNH"
        type="text"
        maxLength={11}
        placeholder="11 dígitos"
        value={cnh}
        onChange={(event) =>
          setCnh(event.target.value.replace(/\D/g, ""))
        }
        error={erros.cnh}
      />

      <Input
        id="validadeCnh"
        label="Validade da CNH"
        type="date"
        value={validadeCnh}
        onChange={(event) =>
          setValidadeCnh(event.target.value)
        }
        error={erros.validadeCnh}
      />

      <Input
        id="telefoneCliente"
        label="Telefone"
        type="tel"
        maxLength={15}
        placeholder="(62) 99999-9999"
        value={telefone}
        onChange={(event) =>
          setTelefone(event.target.value)
        }
        error={erros.telefone}
      />

      <Input
        id="emailCliente"
        label="E-mail"
        type="email"
        placeholder="cliente@email.com"
        value={email}
        onChange={(event) =>
          setEmail(event.target.value)
        }
        error={erros.email}
      />

      <TextArea
        id="enderecoCliente"
        label="Endereço"
        rows={3}
        placeholder="Rua, número, bairro e cidade"
        value={endereco}
        onChange={(event) =>
          setEndereco(event.target.value)
        }
        error={erros.endereco}
      />

      <div className="d-flex gap-2">
        <Button
          type="submit"
          variant="success"
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : cliente
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
