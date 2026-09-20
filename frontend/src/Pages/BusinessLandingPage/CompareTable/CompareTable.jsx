import React from "react";
import "./CompareTable.scss";

const CheckGreen = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" />
    <path
      d="M7.5 12.5l3 3 6-6"
      stroke="#22c55e"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrossRed = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" />
    <path
      d="M15 9l-6 6M9 9l6 6"
      stroke="#ef4444"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

const WarnYellow = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3L22 20.5H2L12 3Z"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="#fff9e6"
    />
    <text
      x="12"
      y="17"
      textAnchor="middle"
      fontSize="9"
      fill="#f59e0b"
      fontWeight="800"
      fontFamily="Poppins,sans-serif"
    >
      !
    </text>
  </svg>
);

const rows = [
  {
    feature: "NFC Card Included",
    nsg: <CheckGreen />,
    others: <CheckGreen />,
  },
  {
    feature: "Profiles",
    nsg: <span className="ct-text">5 Profiles</span>,
    others: (
      <span className="ct-warn-wrap">
        <WarnYellow />
        <small>1 (Limited)</small>
      </span>
    ),
  },
  {
    feature: "Email Signature",
    nsg: <CheckGreen />,
    others: <CheckGreen />,
  },
  {
    feature: "Smart Contact Management (Mini CRM)",
    nsg: <span className="ct-text">Built-in</span>,
    others: (
      <span className="ct-warn-wrap">
        <CrossRed />
        <small>Extra $36/mo</small>
      </span>
    ),
  },
  { feature: "Follow-up Email", nsg: <CheckGreen />, others: <CrossRed /> },
  {
    feature: "Meeting Scheduling",
    nsg: <span className="ct-text">Built-in</span>,
    others: <CrossRed />,
  },
  {
    feature: "Analytics & Insights",
    nsg: <CheckGreen />,
    others: (
      <span className="ct-warn-wrap">
        <WarnYellow />
        <small>(Limited)</small>
      </span>
    ),
  },
  {
    feature: "7000+ App Integrations",
    nsg: <CheckGreen />,
    others: <CheckGreen />,
  },
];

const CompareTable = () => (
  <div className="ct-wrap">
    <div className="ct-badge-row">
      <span className="ct-badge">THE SMART CHOICE</span>
    </div>
    <h2 className="ct-heading">Compare Before You Choose</h2>
    <p className="ct-sub">
      See how NSG outperforms the competition in every category.
    </p>

    <div className="ct-table-wrap">
      <table className="ct-table">
        <thead>
          <tr>
            <th className="ct-th-feat">Features</th>
            <th className="ct-th-nsg">NSG</th>
            <th className="ct-th-others">Others</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="ct-row">
              <td className="ct-td-feat">{row.feature}</td>
              <td className="ct-td-nsg">{row.nsg}</td>
              <td className="ct-td-others">{row.others}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default CompareTable;
