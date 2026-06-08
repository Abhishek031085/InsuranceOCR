import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

function EntryPage() {

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const rmName = "Abhishek Mondal";
  const rmCode = "CIBE165";

  const [company, setCompany] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // ✅ FIX: reset file input

  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(false);

  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [extractedData, setExtractedData] = useState(null);

  const [poPercent, setPoPercent] = useState("");
  const [status, setStatus] = useState("");
  const [issuedOn, setIssuedOn] = useState("");
  const [monthText, setMonthText] = useState("");
  const [copyAgentToSource, setCopyAgentToSource] = useState(false);

  const [saveMsg, setSaveMsg] = useState("");
  const [saveType, setSaveType] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/agents`)
      .then(res => setAgents(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (issuedOn) {
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const date = new Date(issuedOn);
      setMonthText(months[date.getMonth()]);
    }
  }, [issuedOn]);

  const uploadPDF = async () => {

    if (!selectedAgent) {
      setAlertType("danger");
      setMessage("Please select an Agent");
      return;
    }

    if (!company) {
      setAlertType("danger");
      setMessage("Please select Insurance Company");
      return;
    }

    if (!file) {
      setAlertType("danger");
      setMessage("Please select PDF file");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setSaveMsg("");

      const formData = new FormData();
      formData.append("rm_name", rmName);
      formData.append("rm_code", rmCode);
      formData.append("agent", JSON.stringify(selectedAgent));
      formData.append("company", company);
      formData.append("pdf", file);

      const res = await axios.post(`${API_URL}/upload`, formData);

      // 🔥 THIS WILL APPEAR IN BROWSER CONSOLE
      console.log("BROWSER DEBUG RESPONSE:", res.data.debug);
      console.log("EXTRACTED DATA:", res.data.data);

      setExtractedData({
        ...res.data.data,
        sourced_by: ""
      });

      setAlertType("success");
      setMessage("PDF extracted successfully!");

    } catch (err) {
      setAlertType("danger");
      setMessage("Upload failed!");
    } finally {
      setLoading(false);
    }
  };
  //====== reset form------//
  const resetForm = () => {

    setExtractedData(null);
    setCompany("");
    setFile(null);
    setFileName("");
    setSelectedAgent(null);

    setPoPercent("");
    setPaymentMode("");
    setStatus("");
    setIssuedOn("");
    setMonthText("");

    setCopyAgentToSource(false);

    // Clear upload success message
    setMessage("");

    // Reset file input
    setFileInputKey(Date.now());

  };
  const savePolicy = async () => {

    try {

      const payload = {
        rm_name: rmName,
        rm_id: rmCode,
        posp_name: selectedAgent?.label,
        posp_id: selectedAgent?.value,

        insured_name: extractedData?.insured_name,
        vehicle_no: extractedData?.vehicle_no,
        insurer: company,
        payment_mode: paymentMode,

        gross_premium: extractedData?.premium,
        po_percentage: poPercent,
        status: status,
        policy_no: extractedData?.policy_no,

        issued_on: issuedOn,
        month: monthText,
        sourced_by: copyAgentToSource
          ? selectedAgent?.label
          : extractedData?.sourced_by,

        engine_no: extractedData?.engine_no,
        chassis_no: extractedData?.chassis_no,

        creation_date: new Date().toISOString().split("T")[0]
      };

      const res = await axios.post(`${API_URL}/save-policy`, payload);

      if (res.data.success) {

        setSaveType("success");
        setSaveMsg("Policy saved successfully!");

        // ================= RESET EVERYTHING =================
        resetForm();

      } else {
        setSaveType("danger");
        setSaveMsg("Failed to save policy!");
      }

    } catch (error) {

      console.error(error);

      setSaveType("danger");

      if (error.response?.data?.message) {

        setSaveMsg(error.response.data.message);

        // Reset form after duplicate message
        resetForm();

      } else {

        setSaveMsg("Server Error. Please try again.");

      }

    }
  };

  return (

    <div className="container-fluid bg-light min-vh-100 py-4">

      {/* HEADER */}
      <div className="container mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="fw-bold mb-0">Insurance Document Portal</h3>
            <small className="text-muted">Policy Upload & Extraction System</small>
          </div>
          <button className="btn btn-outline-dark" onClick={() => navigate("/")}>
            Back
          </button>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7">

            <div className="card border-0 shadow-lg rounded-4">

              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Upload Policy Document</h5>
              </div>

              <div className="card-body p-4">

                {/* RM INFO */}
                <div className="p-3 mb-4 bg-light rounded-3 border">
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted">RM Name</small>
                      <h6 className="fw-bold">{rmName}</h6>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <small className="text-muted">RM Code</small>
                      <h6 className="fw-bold">{rmCode}</h6>
                    </div>
                  </div>
                </div>

                {/* AGENT */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Select Agent</label>
                  <Select options={agents} value={selectedAgent} onChange={setSelectedAgent} />
                </div>

                {/* COMPANY */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Insurance Company</label>
                  <select className="form-select" value={company} onChange={(e) => setCompany(e.target.value)}>
                    <option value="">Select Company</option>
                    <option>BAJAJ</option>
                    <option>CHOLA</option>
                    <option>DIGIT</option>
                    <option>FUTURE GENERALI</option>
                    <option>HDFC</option>
                    <option>ICICI</option>
                    <option>IFFCO</option>
                    <option>KOTAK</option>
                    <option>MAGMA</option>
                    <option>NATIONAL</option>
                    <option>NEW INDIA</option>
                    <option>ORIENTAL</option>
                    <option>RAHEJA</option>
                    <option>RELIANCE</option>
                    <option>ROYAL SUNDARAM</option>
                    <option>SBI</option>
                    <option>SHRIRAM</option>
                    <option>TATA</option>
                    <option>UNIVERSAL SOMPO</option>
                    <option>UNITED</option>
                    <option>ZUNO</option>
                  </select>
                </div>

                {/* FILE */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Upload Policy PDF</label>

                  <input
                    key={fileInputKey}   // 🔥 IMPORTANT RESET FIX
                    type="file"
                    className="form-control"
                    accept=".pdf"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      setFileName(e.target.files[0]?.name || "");
                    }}
                  />

                  {fileName && (
                    <div className="text-success mt-2">
                      Selected: {fileName}
                    </div>
                  )}
                </div>

                {/* UPLOAD BUTTON */}
                <button
                  className="btn btn-primary w-100 d-flex justify-content-center align-items-center gap-2"
                  disabled={loading}
                  onClick={uploadPDF}
                >
                  {loading && <span className="spinner-border spinner-border-sm"></span>}
                  {loading ? "Extracting..." : "Upload & Extract Policy"}
                </button>

                {/* ALERT */}
                {message && (
                  <div className={`alert alert-${alertType} mt-3`}>
                    {message}
                  </div>
                )}

                {/* SAVE ALERT */}
                {saveMsg && (
                  <div className={`alert alert-${saveType} mt-3`}>
                    {saveMsg}
                  </div>
                )}{saveMsg && (
                  <div
                    className={`alert alert-${saveType} alert-dismissible fade show mt-3`}
                    role="alert"
                  >
                    <strong>
                      {saveType === "success" ? "Success! " : "Warning! "}
                    </strong>

                    {saveMsg}

                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSaveMsg("")}
                    ></button>
                  </div>
                )}

                {/* EXTRACTED DATA */}
                {extractedData && (

                  <div className="mt-4">

                    <div className="card shadow-sm border-0">

                      <div className="card-header bg-success text-white">
                        Extracted Policy Details
                      </div>

                      <div className="card-body">

                        <div className="row g-3">

                          {/* COMPANY */}
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Insurance Company</label>
                            <input className="form-control" value={company} readOnly />
                          </div>

                          {/* DYNAMIC FIELDS */}
                          {[
                            { key: "policy_no", label: "Policy Number" },
                            { key: "insured_name", label: "Insured Name" },
                            { key: "vehicle_no", label: "Vehicle Number" },
                            { key: "engine_no", label: "Engine Number" },
                            { key: "chassis_no", label: "Chassis Number" },
                            { key: "premium", label: "Gross Premium" }
                          ].map((item) => (
                            <div className="col-md-6" key={item.key}>
                              <label className="form-label fw-semibold">{item.label}</label>
                              <input
                                className="form-control"
                                value={extractedData?.[item.key] || ""}
                                onChange={(e) =>
                                  setExtractedData({
                                    ...extractedData,
                                    [item.key]: e.target.value
                                  })
                                }
                              />
                            </div>
                          ))}

                          {/* PO PERCENT */}
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">PO Percentage (%)</label>
                            <input
                              className="form-control"
                              placeholder="Enter PO %"
                              value={poPercent}
                              onChange={(e) => setPoPercent(e.target.value)}
                            />
                          </div>

                          {/* Payment Mode */}
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">Payment Mode (%)</label>
                            <select
                              className="form-select"
                              value={paymentMode}
                              onChange={(e) => setPaymentMode(e.target.value)}
                            >
                              <option value="">Select Mode</option>
                              <option value="ONLINE">ONLINE</option>
                              <option value="CHEQUE">CHEQUE</option>
                            </select>
                          </div>

                          {/* STATUS */}
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">Policy Status</label>
                            <select
                              className="form-select"
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                            >
                              <option value="">Select Status</option>
                              <option>SENT</option>
                              <option>PENDING</option>
                            </select>
                          </div>

                          {/* ISSUED DATE */}
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">Issued Date</label>

                            <input
                              type="date"
                              className="form-control"
                              value={issuedOn}
                              max={new Date().toISOString().split("T")[0]}   // 🔥 blocks future dates
                              onChange={(e) => setIssuedOn(e.target.value)}
                            />
                          </div>

                          {/* MONTH */}
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">Policy Month</label>
                            <input className="form-control bg-light" value={monthText} readOnly />
                          </div>

                          {/* SOURCED BY */}
                          <div className="col-md-8">

                            <label className="form-label fw-semibold">Sourced By</label>

                            <input
                              className="form-control mb-2"
                              value={copyAgentToSource ? selectedAgent?.label : extractedData?.sourced_by || ""}
                              onChange={(e) =>
                                setExtractedData({
                                  ...extractedData,
                                  sourced_by: e.target.value
                                })
                              }
                            />

                            <div className="form-check mb-2">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={copyAgentToSource}
                                onChange={(e) => setCopyAgentToSource(e.target.checked)}
                              />
                              <label className="form-check-label ms-2">
                                Same as Agent
                              </label>
                            </div>

                            {/* SAVE BUTTON */}
                            <button
                              className="btn btn-dark w-100 d-flex justify-content-center align-items-center gap-2"
                              onClick={savePolicy}
                            >
                              Save Policy
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                )}

              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default EntryPage;
