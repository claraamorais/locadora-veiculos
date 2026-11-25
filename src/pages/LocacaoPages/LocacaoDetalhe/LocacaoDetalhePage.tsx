
import {
  useParams,
  useNavigate,
} from "react-router-dom";

import LocacaoDetalhe from "./index";

import Alert from "../../../components/Alert";
import Button from "../../../components/Button";

export default function LocacaoDetalhePage() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      {id ? (
        <LocacaoDetalhe
          locacaoId={id}
          onClose={() =>
            navigate("/locacoes")
          }
        />
      ) : (
        <>
          <Alert variant="danger">
            Locação não identificada.
          </Alert>

          <Button
            variant="secondary"
            onClick={() =>
              navigate("/locacoes")
            }
          >
            Voltar
          </Button>
        </>
      )}
    </div>
  );
}
