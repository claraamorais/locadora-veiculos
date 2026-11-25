
import { Link } from "react-router-dom";
import Card from "../../components/Card";

export default function HomePages() {
  const modulos = [
    { nome: "Marcas", rota: "/marcas", descricao: "Cadastro de marcas de veículos." },
    { nome: "Categorias", rota: "/categorias", descricao: "Categorias e valores de locação." },
    { nome: "Modelos", rota: "/modelos", descricao: "Cadastro de modelos de veículos." },
    { nome: "Veículos", rota: "/veiculos", descricao: "Gerenciamento da frota." },
    { nome: "Manutenções", rota: "/manutencoes", descricao: "Controle de manutenções." },
    { nome: "Clientes", rota: "/clientes", descricao: "Cadastro de clientes." },
    { nome: "Locações", rota: "/locacoes", descricao: "Gerenciamento de locações." },
    { nome: "Contratos", rota: "/contratos", descricao: "Controle de contratos." },
    { nome: "Vistorias", rota: "/vistorias", descricao: "Vistorias de retirada e devolução." },
    { nome: "Pagamentos", rota: "/pagamentos", descricao: "Controle de pagamentos." },
    { nome: "Notas Fiscais", rota: "/notas-fiscais", descricao: "Emissão de notas fiscais." },
  ];

  return (
    <div className="container mt-4 mb-5">
      <h2>Sistema de Locação de Veículos</h2>

      <p className="text-muted mb-4">
        Selecione um módulo para acessar as funcionalidades do sistema.
      </p>

      <div className="row g-4">
        {modulos.map((modulo) => (
          <div className="col-md-4" key={modulo.rota}>
            <Card titulo={modulo.nome} className="h-100">
              <p>{modulo.descricao}</p>

              <Link
                to={modulo.rota}
                className="btn btn-primary"
              >
                Acessar
              </Link>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
