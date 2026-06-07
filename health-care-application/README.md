# HealthCare Records (DeFi)

A decentralized healthcare records system built on Ethereum (Sepolia testnet). Patient medical records — diagnosis, treatment, and visit history — are written to and read from a smart contract, giving the data a tamper-proof, verifiable audit trail instead of relying on a centralized database.

> ⚠️ **Educational project.** Do not use this to store real patient data — anything written to a public blockchain is permanently visible to anyone. See [Security & Privacy Notes](#security--privacy-notes) below.

---

## Tech Stack

| Layer            | Technology                                |
| ---------------- | ----------------------------------------- |
| Frontend         | React 19, CSS (custom Vercel/shadcn-style dark theme) |
| Blockchain SDK   | ethers.js v6                               |
| Wallet           | MetaMask (browser extension)               |
| Network          | Ethereum Sepolia testnet                   |
| Notifications    | react-toastify                              |
| Icons            | lucide-react                                |

---

## How It Works (App Flow)

1. **Connect Wallet** — On load, the app asks MetaMask for account access via `window.ethereum`, creates an `ethers.BrowserProvider`, and instantiates the smart contract with the connected signer. The connected wallet address is shown in the header chip (with a copy-to-clipboard button).

2. **Ownership Check** — The app calls `getOwner()` on the contract and compares it to the connected address. If they match, an **"Contract Owner"** badge appears, unlocking owner-level context (e.g. authorizing providers).

3. **Add a Patient Record** — A healthcare provider fills in Patient ID, Name, Diagnosis, and Treatment, and submits via `addPatientRecord(...)`. This sends a transaction to the contract, which permanently stores the record on-chain along with a block timestamp.

4. **Authorize a Provider** — The contract owner can grant another wallet address permission to add records, via `authorizeTheProvider(address)`. Only authorized addresses can write patient data.

5. **Fetch Records** — Anyone can look up a patient's full record history by entering a Patient ID and calling the read-only function `fetchAllRecords(patientID)`. Results are rendered in the **Audit Log** table.

6. **Audit Log** — Displays every fetched record with: Patient ID, Patient Name, Diagnosis, Treatment, Data Source (the contract address), Status, and Date/Time. It supports:
   - **Sort** — toggle newest/oldest first (by on-chain timestamp)
   - **Export** — download the currently displayed records as a CSV file
   - **Responsive layout** — collapses into stacked cards on mobile (no horizontal scrolling)

---

## Smart Contract Interface

The frontend talks to a Solidity contract (`HealthCareSystem`) deployed on Sepolia at the address defined in `src/HealthCare.js`. Its interface (ABI) exposes:

| Function                                              | Type  | Description                                         |
| ----------------------------------------------------- | ----- | --------------------------------------------------- |
| `addPatientRecord(id, name, diagnosis, treatment)`     | write | Adds a new record for a patient (authorized only)   |
| `authorizeTheProvider(address)`                        | write | Grants an address permission to add records (owner only) |
| `fetchAllRecords(patientID)`                           | read  | Returns every record stored for a given patient ID  |
| `getOwner()` / `owner()`                               | read  | Returns the contract owner's address                |
| `authorizedUser(address)`                              | read  | Checks whether an address is authorized              |
| `patientRecords(patientID, index)`                     | read  | Returns a single record by index                     |

Each `Record` struct contains: `record_id`, `patient_name`, `diagnosis`, `treatment`, `timestamp`.

---

## Running This Project Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended) and npm
- [MetaMask](https://metamask.io/) browser extension
- A wallet funded with **Sepolia testnet ETH** (use a faucet such as [sepoliafaucet.com](https://sepoliafaucet.com/))

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/DhruuvShah/Web-3.0-Project.git
   cd Web-3.0-Project/health-care-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Connect to your own contract (optional)**
   If you want to use your own deployed instance instead of the existing one, open `src/HealthCare.js` and replace the `contractAddress` constant with your deployed contract's address. Make sure the ABI matches your contract's interface.

4. **Start the development server**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Connect MetaMask**
   - Switch MetaMask's network to **Sepolia**
   - Click **Connect** when the app prompts for wallet access
   - Make sure your wallet has Sepolia test ETH to pay gas for write transactions (adding records / authorizing providers)

### Available Scripts

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm start`     | Runs the app in development mode             |
| `npm run build` | Builds an optimized production bundle to `build/` |
| `npm test`      | Runs the test suite in watch mode            |

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set the **Root Directory** to `health-care-application`
4. Deploy — Vercel auto-detects the Create React App build settings

---

## Security & Privacy Notes

- The **contract address** is safe to expose — it's already public on-chain the moment the contract is deployed.
- **Patient medical data** (name, diagnosis, treatment) written to this contract is permanently visible to anyone who queries it — this is inherent to public blockchains, not a bug. A real production system would store sensitive data off-chain (encrypted database) and keep only a verification hash on-chain.
- This project targets the **Sepolia testnet** — no real funds or real patient data should ever be used with it.

---

## Project Structure

```
health-care-application/
├── public/              # Static assets (favicon, manifest, index.html)
├── src/
│   ├── HealthCare.js    # Main component — wallet connection, contract calls, UI
│   ├── App.js           # App entry wrapper
│   ├── App.css          # Theme, layout, and component styles
│   └── index.js         # React DOM render entry point
└── package.json
```

---

Built with [Create React App](https://github.com/facebook/create-react-app).
