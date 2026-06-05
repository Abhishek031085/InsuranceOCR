import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {

  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalPremium: 0,
    totalNOP: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [policyData, setPolicyData] = useState([]);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    fetchAgentSummary();
  }, []);

  const fetchAgentSummary = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/agent-summary");

      if (res.data.success) {
        setAgents(res.data.data);

        let premium = 0;
        let nop = 0;

        res.data.data.forEach((a) => {
          premium += Number(a.total_premium || 0);
          nop += Number(a.total_nop || 0);
        });

        setSummary({ totalPremium: premium, totalNOP: nop });
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openPopup = async (name) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/policies-by-source/${name}`
      );

      if (res.data.success) {
        setPolicyData(res.data.data);
        setSelectedName(name);
        setShowModal(true);
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      {/* ================= HEADER ================= */}
      <div className="text-center mb-4">
        <h2 className="fw-bold">Insurance Dashboard</h2>
        <p className="text-muted">Live business intelligence overview</p>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="card border-0 shadow-lg rounded-4 p-3 text-white"
            style={{ background: "linear-gradient(135deg,#1d976c,#93f9b9)" }}>
            <h6>Total Premium</h6>
            <h3 className="fw-bold">₹ {summary.totalPremium.toLocaleString()}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-lg rounded-4 p-3 text-white"
            style={{ background: "linear-gradient(135deg,#396afc,#2948ff)" }}>
            <h6>Total Policies</h6>
            <h3 className="fw-bold">{summary.totalNOP}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 shadow-lg rounded-4 p-3 text-center h-100"
            style={{
              cursor: "pointer",
              background: "#fff",
              transition: "0.25s"
            }}
            onClick={() => navigate("/entry")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
            }}
          >
            <h6 className="text-muted">Quick Action</h6>

            <h5 className="fw-bold text-primary">
              PDF Extraction
            </h5>


          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-0 shadow-lg rounded-4 p-3 text-center h-100"
            style={{
              cursor: "pointer",
              background: "#fff",
              transition: "0.25s"
            }}
            onClick={() => navigate("/excel-download")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
            }}
          >
            <h6 className="text-muted">Quick Action</h6>

            <h5 className="fw-bold text-success">
              Excel Extraction for Ops
            </h5>


          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 shadow-lg rounded-4 p-3 text-center h-100"
            style={{
              cursor: "pointer",
              background: "#fff",
              transition: "0.25s"
            }}
            onClick={() => navigate("/posp-report")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 12px 25px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 10px rgba(0,0,0,0.08)";
            }}
          >
            <h6 className="text-muted">Quick Action</h6>

            <h5 className="fw-bold text-warning">
              POSP Report Download
            </h5>

            <small className="text-muted">
              Download agent-wise business report
            </small>
          </div>
        </div>


      </div>

      {/* ================= AGENT SECTION ================= */}
      <div className="mb-3">
        <h5 className="fw-bold">Agent Performance</h5>
      </div>

      {/* ================= AGENT CARDS ================= */}
      <div className="row g-4">

        {agents.map((a, i) => (

          <div className="col-lg-3 col-md-4 col-sm-6" key={i}>

            <div
              className="card border-0 shadow-sm rounded-4 p-3 h-100"
              style={{
                cursor: "pointer",
                transition: "0.25s",
                background: "#fff"
              }}
              onClick={() => openPopup(a.name)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
              }}
            >

              <div className="fw-bold text-dark">{a.name}</div>

              <hr />

              <div className="d-flex justify-content-between">
                <span className="text-muted">Premium</span>
                <span className="fw-bold text-success">
                  ₹ {Number(a.total_premium || 0).toLocaleString()}
                </span>
              </div>

            </div>

          </div>

        ))}

      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)" }}>

          <div className="modal-dialog modal-xl">

            <div className="modal-content rounded-4">

              <div className="modal-header bg-dark text-white">
                <h5 className="mb-0">Policies - {selectedName}</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body">

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead className="table-light">
                      <tr>
                        <th>Insured</th>
                        <th>Vehicle</th>
                        <th>Engine</th>
                        <th>Chassis</th>
                        <th>Insurer</th>
                        <th>Policy No</th>
                        <th>Premium</th>
                        <th>Issued On</th>
                      </tr>
                    </thead>

                    <tbody>
                      {policyData.map((p, i) => (
                        <tr key={i}>
                          <td>{p.insured_name}</td>
                          <td>{p.vehicle_no}</td>
                          <td>{p.engine_no}</td>
                          <td>{p.chassis_no}</td>
                          <td>{p.insurer}</td>
                          <td>{p.policy_no}</td>
                          <td className="fw-bold text-success">
                            ₹ {p.gross_premium}
                          </td>
                          <td>{p.issued_on}</td>
                        </tr>
                      ))}
                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;