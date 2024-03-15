import "bootstrap/dist/css/bootstrap.min.css";
import PatientInfo from "./PatientInfo";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <PatientInfo />
    </BrowserRouter>
  );
}

export default App;
