import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { ethers, BrowserProvider } from "ethers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Activity,
  Search,
  FilePlus,
  ShieldCheck,
  ShieldPlus,
  ArrowUp,
  ArrowDown,
  Download,
  Copy,
  SendHorizontal,
  FileText,
} from "lucide-react";

const contractAddress = "0xfbF645644dc2a982336fd0247afDfF0F74f3Fd54";
const contractABI = [
  {
    inputs: [
      { internalType: "uint256", name: "patientID", type: "uint256" },
      { internalType: "string", name: "_patient_name", type: "string" },
      { internalType: "string", name: "_diagnosis", type: "string" },
      { internalType: "string", name: "_treatment", type: "string" },
    ],
    name: "addPatientRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "provider", type: "address" }],
    name: "authorizeTheProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "authorizedUser",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_patient_id", type: "uint256" }],
    name: "fetchAllRecords",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "record_id", type: "uint256" },
          { internalType: "string", name: "patient_name", type: "string" },
          { internalType: "string", name: "diagnosis", type: "string" },
          { internalType: "string", name: "treatment", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct HealthCareSystem.Record[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "patientRecords",
    outputs: [
      { internalType: "uint256", name: "record_id", type: "uint256" },
      { internalType: "string", name: "patient_name", type: "string" },
      { internalType: "string", name: "diagnosis", type: "string" },
      { internalType: "string", name: "treatment", type: "string" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const shortAddr = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
const shortContract = `${contractAddress.slice(0, 6)}...${contractAddress.slice(-3)}`;

const Healthcare = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [currentAccountAddress, setCurrentAccountAddress] = useState("");
  const [authorizedUser, setAuthorizedUser] = useState("");
  const [smartContract, setSmartContract] = useState(null);
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientDiagnosis, setPatientDiagnosis] = useState("");
  const [patientTreatment, setPatientTreatment] = useState("");
  const [currentPatientId, setCurrentPatientId] = useState("");
  const [allPatientRecords, setAllPatientRecords] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) {
        toast.error("Ethereum wallet not found. Please install MetaMask.");
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        const accountAddress = await signer.getAddress();
        setCurrentAccountAddress(accountAddress);
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );
        const owner = await contract.getOwner();
        setSmartContract(contract);
        setIsOwner(accountAddress.toLowerCase() === owner.toLowerCase());
        toast.success("Wallet connected successfully!");
      } catch (error) {
        toast.error("Failed to connect wallet.");
      }
    };
    connectWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(currentAccountAddress);
    toast.success("Address copied!", { autoClose: 2000 });
  };

  const toggleSort = () => {
    setSortOrder((prev) => {
      const next = prev === "desc" ? "asc" : "desc";
      toast.info(
        next === "desc" ? "Sorted: Newest first" : "Sorted: Oldest first",
        {
          autoClose: 1500,
        },
      );
      return next;
    });
  };

  const exportCSV = () => {
    if (allPatientRecords.length === 0) {
      toast.warning("No records to export.");
      return;
    }
    const headers = [
      "Patient ID",
      "Patient Name",
      "Diagnosis",
      "Treatment",
      "Data Source",
      "Status",
      "Date / Time",
    ];
    const rows = allPatientRecords.map((r) => [
      Number(r.record_id),
      r.patient_name,
      r.diagnosis,
      r.treatment,
      contractAddress,
      "Confirmed",
      new Date(Number(r.timestamp) * 1000).toLocaleString(),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patient_records_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${allPatientRecords.length} record(s) as CSV.`);
  };

  const authorizeProvider = async () => {
    if (!authorizedUser) {
      toast.warning("Please enter a provider address.");
      return;
    }
    const toastId = toast.loading("Authorizing provider...");
    try {
      await smartContract.authorizeTheProvider(authorizedUser);
      setAuthorizedUser("");
      toast.update(toastId, {
        render: "Provider authorized successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to authorize provider.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const addRecords = async () => {
    if (!patientId || !patientName || !patientDiagnosis || !patientTreatment) {
      toast.warning("Please fill in all fields.");
      return;
    }
    const toastId = toast.loading("Adding patient record...");
    try {
      await smartContract.addPatientRecord(
        patientId,
        patientName,
        patientDiagnosis,
        patientTreatment,
      );
      setPatientId("");
      setPatientName("");
      setPatientDiagnosis("");
      setPatientTreatment("");
      toast.update(toastId, {
        render: "Patient record added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to add patient record.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const fetchPatientRecords = async () => {
    if (!currentPatientId) {
      toast.warning("Please enter a patient ID.");
      return;
    }
    const toastId = toast.loading("Fetching records...");
    try {
      const records = await smartContract.fetchAllRecords(currentPatientId);
      setAllPatientRecords(records);
      setCurrentPatientId("");
      toast.update(toastId, {
        render:
          records.length > 0
            ? `Found ${records.length} record(s).`
            : "No records found.",
        type: records.length > 0 ? "success" : "info",
        isLoading: false,
        autoClose: 4000,
      });
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to fetch patient records.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const sortedRecords = [...allPatientRecords].sort((a, b) => {
    const diff = Number(a.timestamp) - Number(b.timestamp);
    return sortOrder === "desc" ? -diff : diff;
  });

  return (
    <div>
      <ToastContainer
        position="top-right"
        theme="dark"
        pauseOnHover
        closeOnClick
      />

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            <Activity size={13} strokeWidth={2.5} />
          </div>
          <h1 className="header-title">HealthCare Records (DeFi)</h1>
        </div>
        <div className="header-right">
          {currentAccountAddress && (
            <button className="wallet-chip" onClick={copyAddress}>
              <span className="wallet-dot" />
              {shortAddr(currentAccountAddress)}
              <Copy size={11} strokeWidth={2} className="wallet-copy" />
            </button>
          )}
          {isOwner && <span className="owner-badge">Contract Owner</span>}
        </div>
      </header>

      {/* Main */}
      <main className="main">
        <div className="cards-grid">
          {/* Fetch Records */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Fetch Records</span>
              <Search size={16} strokeWidth={1.75} className="card-icon" />
            </div>
            <input
              className="input-field"
              type="text"
              placeholder="Enter Patient ID"
              value={currentPatientId}
              onChange={(e) => setCurrentPatientId(e.target.value)}
            />
            <p className="card-desc">
              Search the decentralized ledger for verified medical history
              associated with this ID.
            </p>
            <button className="btn-secondary" onClick={fetchPatientRecords}>
              <Search size={14} strokeWidth={2} />
              Fetch Records
            </button>
          </div>

          {/* Add Patient Record */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Add Patient Record</span>
              <FilePlus size={16} strokeWidth={1.75} className="card-icon" />
            </div>
            <div className="input-row">
              <input
                className="input-field"
                type="text"
                placeholder="Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
              <input
                className="input-field"
                type="text"
                placeholder="Patient Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <input
              className="input-field"
              type="text"
              placeholder="Diagnosis"
              value={patientDiagnosis}
              onChange={(e) => setPatientDiagnosis(e.target.value)}
            />
            <input
              className="input-field"
              type="text"
              placeholder="Treatment"
              value={patientTreatment}
              onChange={(e) => setPatientTreatment(e.target.value)}
            />
            <button className="btn-primary" onClick={addRecords}>
              <SendHorizontal size={14} strokeWidth={2} />
              Submit Record
            </button>
          </div>

          {/* Provider Auth */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Provider Auth</span>
              <ShieldCheck size={16} strokeWidth={1.75} className="card-icon" />
            </div>
            <div className="status-box">
              <p className="status-box-label">Active Status</p>
              <p className="status-box-value">Provider Registry Online</p>
            </div>
            <div>
              <label className="input-label">Provider Wallet Address</label>
              <input
                className="input-field"
                type="text"
                placeholder="0x..."
                value={authorizedUser}
                onChange={(e) => setAuthorizedUser(e.target.value)}
              />
            </div>
            <button className="btn-secondary" onClick={authorizeProvider}>
              <ShieldPlus size={14} strokeWidth={2} />
              Grant Authorization
            </button>
          </div>
        </div>

        {/* Audit Log */}
        <div className="audit-section">
          <div className="audit-header">
            <h2 className="audit-title">Recent Activity / Audit Log</h2>
            <div className="audit-actions">
              <button
                className="icon-btn"
                onClick={toggleSort}
                title={
                  sortOrder === "desc"
                    ? "Showing newest first"
                    : "Showing oldest first"
                }
              >
                {sortOrder === "desc" ? (
                  <ArrowDown size={15} strokeWidth={1.75} />
                ) : (
                  <ArrowUp size={15} strokeWidth={1.75} />
                )}
              </button>
              <button
                className="icon-btn"
                onClick={exportCSV}
                title="Export as CSV"
              >
                <Download size={15} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {sortedRecords.length === 0 ? (
            <div className="audit-empty">
              No records to display.
              <br />
              Fetch a patient's records above to see them here.
            </div>
          ) : (
            <>
              <div className="audit-table-wrapper">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Patient Name</th>
                      <th>Diagnosis</th>
                      <th>Treatment</th>
                      <th>Data Source</th>
                      <th>Status</th>
                      <th>Date / Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRecords.map((record, index) => (
                      <tr key={index}>
                        <td data-label="Patient ID" className="td-mono">
                          {Number(record.record_id)}
                        </td>
                        <td data-label="Patient Name">
                          <span className="action-cell">
                            <FileText
                              size={13}
                              strokeWidth={1.75}
                              className="action-icon"
                            />
                            {record.patient_name}
                          </span>
                        </td>
                        <td data-label="Diagnosis">{record.diagnosis}</td>
                        <td data-label="Treatment">{record.treatment}</td>
                        <td data-label="Data Source" className="td-mono">
                          {shortContract}
                        </td>
                        <td data-label="Status">
                          <span className="badge badge-confirmed">
                            Confirmed
                          </span>
                        </td>
                        <td data-label="Date / Time" className="td-mono">
                          {new Date(
                            Number(record.timestamp) * 1000,
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="audit-footer">
                <button className="view-all-link">
                  View All Blockchain Transactions
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Healthcare;
