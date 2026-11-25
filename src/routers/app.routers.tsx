
import { Routes, Route } from "react-router-dom";

import HomePages from "../pages/HomePages";
import MarcaPages from "../pages/MarcaPages";
import CategoriaPages from "../pages/CategoriaPages";
import ModeloPages from "../pages/ModeloPages";
import VeiculoPages from "../pages/VeiculoPages";

import Alert from "../components/Alert";

function EmDesenvolvimento({ titulo }: { titulo: string }) {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">{titulo}</h2>

      <Alert variant="info">
        Este módulo está em desenvolvimento.
      </Alert>
    </div>
  );
}

export default function AppRouters() {
  return (
    <Routes>
      <Route path="/" element={<HomePages />} />

      <Route path="/marcas" element={<MarcaPages />} />

      <Route path="/categorias" element={<CategoriaPages />} />

      <Route path="/modelos" element={<ModeloPages />} />

      <Route path="/veiculos" element={<VeiculoPages />} />

      <Route
        path="/manutencoes"
        element={<EmDesenvolvimento titulo="Manutenções" />}
      />

      <Route
        path="/clientes"
        element={<EmDesenvolvimento titulo="Clientes" />}
      />

      <Route
        path="/locacoes"
        element={<EmDesenvolvimento titulo="Locações" />}
      />

      <Route
        path="/contratos"
        element={<EmDesenvolvimento titulo="Contratos" />}
      />

      <Route
        path="/vistorias"
        element={<EmDesenvolvimento titulo="Vistorias" />}
      />

      <Route
        path="/pagamentos"
        element={<EmDesenvolvimento titulo="Pagamentos" />}
      />

      <Route
        path="/notas-fiscais"
        element={<EmDesenvolvimento titulo="Notas Fiscais" />}
      />

      <Route
        path="*"
        element={
          <div className="container mt-4">
            <Alert variant="danger">
              Página não encontrada.
            </Alert>
          </div>
        }
      />
    </Routes>
  );
}
