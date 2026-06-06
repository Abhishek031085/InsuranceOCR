import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ExcelDownload() {

  // ==========================================
  // NAVIGATION
  // ==========================================
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
   const API_URL = import.meta.env.VITE_API_URL;
  // ==========================================
  // DOWNLOAD EXCEL
  // ==========================================
  const downloadExcel = async () => {

    try {

      if (!fromDate || !toDate) {
        alert("Please select From Date and To Date");
        return;
      }

      setLoading(true);

      const res = await axios.post(
        `${API_URL}/export-excel`,
        {
          fromDate,
          toDate
        },
        {
          responseType: "blob"
        }
      );

      // Create downloadable file
      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );

      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `Policies_${fromDate}_to_${toDate}.xlsx`
      );

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {

      console.error("Excel Export Error:", err);
      alert("Failed to export Excel");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div
      className="container-fluid py-5"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#f5f7fa,#e4ecfb)"
      }}
    >

      {/* ==========================================
          PAGE HEADER
      ========================================== */}
      <div className="container mb-4">

        <div className="d-flex justify-content-between align-items-center">

          <div>

            <h2 className="fw-bold mb-1">
              Excel Export Center
            </h2>

            <p className="text-muted mb-0">
              Download policy data 
            </p>

          </div>

          {/* ==========================================
              BACK TO DASHBOARD CARD
          ========================================== */}
          <div
            className="card border-0 shadow-sm px-4 py-3"
            style={{
              cursor: "pointer",
              transition: "0.25s",
              background: "#fff"
            }}
            onClick={() => navigate("/")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 12px 25px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 10px rgba(0,0,0,0.08)";
            }}
          >
            <div className="d-flex align-items-center gap-2">

              <span style={{ fontSize: "20px" }}>
                ⬅️
              </span>

              <span className="fw-bold text-primary">
                Back to Dashboard
              </span>

            </div>
          </div>

        </div>

      </div>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}
      <div className="container">

        <div className="row justify-content-center">

          <div className="col-lg-8">

            {/* ==========================================
                EXCEL EXPORT CARD
            ========================================== */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">

              {/* CARD HEADER */}
              <div
                className="card-header text-white py-3"
                style={{
                  background:
                    "linear-gradient(135deg,#11998e,#38ef7d)"
                }}
              >
                <h5 className="mb-0">
                  Policy Excel Download
                </h5>
              </div>

              {/* CARD BODY */}
              <div className="card-body p-4">

                {/* ==========================================
                    DATE SELECTION ROW
                ========================================== */}
                <div className="row g-4">

                  {/* FROM DATE */}
                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      From Date
                    </label>

                    <input
                      type="date"
                      className="form-control form-control-lg"
                      value={fromDate}
                      onChange={(e) =>
                        setFromDate(e.target.value)
                      }
                    />

                  </div>

                  {/* TO DATE */}
                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      To Date
                    </label>

                    <input
                      type="date"
                      className="form-control form-control-lg"
                      value={toDate}
                      onChange={(e) =>
                        setToDate(e.target.value)
                      }
                    />

                  </div>

                </div>

                

                {/* ==========================================
                    DOWNLOAD BUTTON
                ========================================== */}
                <button
                  className="btn btn-success btn-lg w-100"
                  onClick={downloadExcel}
                  disabled={loading}
                >

                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Generating Excel...
                    </>
                  ) : (
                    <>
                      📊 Generate & Download Excel
                    </>
                  )}

                </button>

              </div>

            </div>

            {/* ==========================================
                FOOTER NOTE
            ========================================== */}
            <div className="text-center mt-3">

              <small className="text-muted">
                Select a date range and click download.
                The Excel file will be generated automatically.
              </small>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default ExcelDownload;
