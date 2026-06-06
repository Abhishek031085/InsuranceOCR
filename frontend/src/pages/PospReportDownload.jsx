import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";

function PospReportDownload() {

  // ==========================================
  // NAVIGATION
  // ==========================================
  const navigate = useNavigate();
   const API_URL = import.meta.env.VITE_API_URL;
  // ==========================================
  // STATES
  // ==========================================
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);

  // ==========================================
  // LOAD POSP LIST
  // ==========================================
  useEffect(() => {

    axios
      .get(`${API_URL}/agents`)
      .then((res) => {
        setAgents(res.data);
      })
      .catch((err) => {
        console.error(err);
      });

  }, []);

  // ==========================================
  // DOWNLOAD REPORT
  // ==========================================
  const downloadReport = async () => {

    if (!selectedAgent) {
      alert("Please select a POSP");
      return;
    }

    if (!fromDate || !toDate) {
      alert("Please select date range");
      return;
    }

    if (fromDate > toDate) {
      alert("From Date cannot be greater than To Date");
      return;
    }

    try {

      setLoading(true);

      const res = await axios.post(
        `${API_URL}/export-posp-report`,
        {
          pospId: selectedAgent.value,
          fromDate,
          toDate
        },
        {
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        `POSP_Report_${selectedAgent.value}_${fromDate}_${toDate}.xlsx`
      );

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {

      console.error(err);
      alert("Failed to download report");

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

      {/* =======================================
          PAGE HEADER
      ======================================= */}
      <div className="container mb-4">

        <div className="d-flex justify-content-between align-items-center">

          <div>

            <h2 className="fw-bold mb-1">
              POSP Report Center
            </h2>

            <p className="text-muted mb-0">
              Download POSP-wise business reports
            </p>

          </div>

          {/* BACK CARD */}
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

              <span style={{ fontSize: "18px" }}>
                ⬅️
              </span>

              <span className="fw-bold text-primary">
                Back to Dashboard
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =======================================
          MAIN CARD
      ======================================= */}
      <div className="container">

        <div className="row justify-content-center">

          <div className="col-lg-8">

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">

              {/* HEADER */}
              <div
                className="card-header text-white py-3"
                style={{
                  background:
                    "linear-gradient(135deg,#ff9966,#ff5e62)"
                }}
              >
                <h5 className="mb-0">
                  POSP Excel Report Download
                </h5>
              </div>

              {/* BODY */}
              <div className="card-body p-4">

                <div className="row g-4">

                  {/* POSP */}
                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      Select POSP
                    </label>

                    <Select
                      options={agents}
                      value={selectedAgent}
                      onChange={setSelectedAgent}
                      placeholder="Search POSP Name..."
                      isSearchable
                    />

                  </div>

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

                

                {/* DOWNLOAD BUTTON */}
                <button
                  className="btn btn-warning btn-lg w-100 fw-bold"
                  onClick={downloadReport}
                  disabled={loading}
                >

                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      📊 Download POSP Report
                    </>
                  )}

                </button>

              </div>

            </div>

            {/* FOOTER */}
            <div className="text-center mt-3">

              <small className="text-muted">
                Select POSP and date range to generate Excel report.
              </small>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default PospReportDownload;
