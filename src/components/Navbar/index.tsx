
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">
          Locadora de Veículos
        </NavLink>

        <div className="navbar-nav flex-wrap">
          <NavLink className="nav-link" to="/" end>
            Início
          </NavLink>

          <NavLink className="nav-link" to="/marcas">
            Marcas
          </NavLink>

          <NavLink className="nav-link" to="/categorias">
            Categorias
          </NavLink>

          <NavLink className="nav-link" to="/modelos">
            Modelos
          </NavLink>

          <NavLink className="nav-link" to="/veiculos">
            Veículos
          </NavLink>

          <NavLink className="nav-link" to="/manutencoes">
            Manutenções
          </NavLink>

          <NavLink className="nav-link" to="/clientes">
            Clientes
          </NavLink>

          <NavLink className="nav-link" to="/locacoes">
            Locações
          </NavLink>

          <NavLink className="nav-link" to="/contratos">
            Contratos
          </NavLink>

          <NavLink className="nav-link" to="/vistorias">
            Vistorias
          </NavLink>

          <NavLink className="nav-link" to="/pagamentos">
            Pagamentos
          </NavLink>

          <NavLink className="nav-link" to="/notas-fiscais">
            Notas Fiscais
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
