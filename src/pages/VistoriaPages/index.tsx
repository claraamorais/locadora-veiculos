
import { useEffect, useState } from "react";

import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Select from "../../components/Select";

import VistoriaForm from "./VistoriaForm";
import VistoriaTable from "./VistoriaTable";

import type {
  IVistoria,
} from "../../models/vistoria.model";

import type {
  ILocacao,
} from "../../models/locacao.model";

import type {
  ICliente,
} from "../../models/cliente.model";

import type {
  IVeiculo,
} from "../../models/veiculo.model";

import type {
  IModelo,
} from "../../models/modelo.model";

import {
  listarVistorias,
  criarVistoria,
} from "../../service/vistoria.service";

import {
  listarLocacoes,
} from "../../service/locacao.service";

import {
  listarClientes,
} from "../../service/cliente.service";

import {
  listarVeiculos,
} from "../../service/veiculo.service";

import {
  listarModelos,
} from "../../service/modelo.service";

export default function VistoriaPages() {
  const [vistorias, setVistorias] =
    useState<IVistoria[]>([]);

  const [locacoes, setLocacoes] =
    useState<ILocacao[]>([]);

  const [clientes, setClientes] =
    useState<ICliente[]>([]);

  const [veiculos, setVeiculos] =
    useState<IVeiculo[]>([]);

  const [modelos, setModelos] =
    useState<IModelo[]>([]);

  const [filtroTipo, setFiltroTipo] =
    useState("");

  const [filtroLocacao, setFiltroLocacao] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [
        dadosVistorias,
        dadosLocacoes,
        dadosClientes,
        dadosVeiculos,
        dadosModelos,
      ] = await Promise.all([
        listarVistorias(),
        listarLocacoes(),
        listarClientes(),
        listarVeiculos(),
        listarModelos(),
      ]);

      setVistorias(dadosVistorias);
      setLocacoes(dadosLocacoes);
      setClientes(dadosClientes);
      setVeiculos(dadosVeiculos);
      setModelos(dadosModelos);
    } catch {
      setErro(
        "Erro ao carregar os dados de vistorias."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function salvarVistoria(
    vistoria: IVistoria
  ) {
    setErro("");
    setMensagem("");

    try {
      await criarVistoria(vistoria);

      if (vistoria.tipo === "RETIRADA") {
        setMensagem(
          "Vistoria de retirada registrada com sucesso!"
        );
      } else {
        setMensagem(
          "Vistoria de devolução registrada! Locação finalizada e veículo liberado."
        );
      }

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao registrar vistoria."
      );

      throw error;
    }
  }

  const vistoriasFiltradas = vistorias
    .filter(
      (vistoria) =>
        (
          !filtroTipo ||
          vistoria.tipo === filtroTipo
        ) &&
        (
          !filtroLocacao ||
          vistoria.locacaoId === filtroLocacao
        )
    )
    .sort(
      (a, b) => b.data.localeCompare(a.data)
    );

  const retiradas = vistorias.filter(
    (item) => item.tipo === "RETIRADA"
  ).length;

  const devolucoes = vistorias.filter(
    (item) => item.tipo === "DEVOLUCAO"
  ).length;

  const retiradasPendentes = locacoes.filter(
    (locacao) =>
      locacao.status === "ABERTA" &&
      !vistorias.some(
        (vistoria) =>
          vistoria.locacaoId === locacao.id &&
          vistoria.tipo === "RETIRADA"
      )
  ).length;

  const devolucoesPendentes = locacoes.filter(
    (locacao) =>
      locacao.status === "ABERTA" &&
      vistorias.some(
        (vistoria) =>
          vistoria.locacaoId === locacao.id &&
          vistoria.tipo === "RETIRADA"
      ) &&
      !vistorias.some(
        (vistoria) =>
          vistoria.locacaoId === locacao.id &&
          vistoria.tipo === "DEVOLUCAO"
      )
  ).length;

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      <h2 className="mb-4">
        Gerenciamento de Vistorias
      </h2>

      {mensagem && (
        <Alert variant="success">
          {mensagem}
        </Alert>
      )}

      {erro && (
        <Alert variant="danger">
          {erro}
        </Alert>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <Card titulo="Retiradas registradas">
            <h3 className="text-primary">
              {retiradas}
            </h3>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Devoluções registradas">
            <h3 className="text-success">
              {devolucoes}
            </h3>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Retiradas pendentes">
            <h3 className="text-warning">
              {retiradasPendentes}
            </h3>
          </Card>
        </div>

        <div className="col-6 col-md-3">
          <Card titulo="Devoluções pendentes">
            <h3 className="text-danger">
              {devolucoesPendentes}
            </h3>
          </Card>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-3">
          <Card titulo="Nova vistoria">
            <VistoriaForm
              locacoes={locacoes}
              vistorias={vistorias}
              clientes={clientes}
              veiculos={veiculos}
              modelos={modelos}
              onSave={salvarVistoria}
              onCancel={() => {
                setErro("");
                setMensagem("");
              }}
            />
          </Card>
        </div>

        <div className="col-lg-9">
          <Card titulo="Histórico de Vistorias">
            <div className="row">
              <div className="col-md-6">
                <Select
                  id="filtroTipoVistoria"
                  label="Filtrar por tipo"
                  value={filtroTipo}
                  onChange={(event) =>
                    setFiltroTipo(
                      event.target.value
                    )
                  }
                  opcoes={[
                    {
                      value: "RETIRADA",
                      label: "Retirada",
                    },
                    {
                      value: "DEVOLUCAO",
                      label: "Devolução",
                    },
                  ]}
                />
              </div>

              <div className="col-md-6">
                <Select
                  id="filtroLocacaoVistoria"
                  label="Filtrar por locação"
                  value={filtroLocacao}
                  onChange={(event) =>
                    setFiltroLocacao(
                      event.target.value
                    )
                  }
                  opcoes={locacoes.map((item) => {
                    const cliente = clientes.find(
                      (c) => c.id === item.clienteId
                    );

                    const veiculo = veiculos.find(
                      (v) => v.id === item.veiculoId
                    );

                    return {
                      value: item.id ?? "",
                      label:
                        `${cliente?.nome ?? "-"} - ${veiculo?.placa ?? "-"} (${item.id})`,
                    };
                  })}
                />
              </div>
            </div>

            {carregando ? (
              <p>Carregando vistorias...</p>
            ) : (
              <>
                <p className="text-muted">
                  Exibindo {vistoriasFiltradas.length}
                  {" "}de {vistorias.length} vistorias.
                </p>

                <VistoriaTable
                  vistorias={vistoriasFiltradas}
                  locacoes={locacoes}
                  clientes={clientes}
                  veiculos={veiculos}
                  modelos={modelos}
                />
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
