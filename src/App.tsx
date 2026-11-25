
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRouters from "./routers/app.routers";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRouters />
    </BrowserRouter>
  );
}
