import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import EntryPage from "./pages/EntryPage";
import ExcelDownload from "./pages/ExcelDownload";
import PospReportDownload from "./pages/PospReportDownload";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/entry"
          element={<EntryPage />}
        />

        <Route path="/excel-download" element={<ExcelDownload />} />

        <Route
          path="/posp-report"
          element={<PospReportDownload />}
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;