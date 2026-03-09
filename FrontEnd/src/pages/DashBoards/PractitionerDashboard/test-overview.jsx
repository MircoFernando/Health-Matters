import React, { useState } from "react";

const initialReferrals = [
  {
    id: "REF-2026-001",
    patient: "John Smith",
    date: "2026-02-24",
    service: "Physiotherapy",
    status: "Pending",
    assignedTo: "",
    assignedFrom: "Dr. Alan Parker",
  },
  {
    id: "REF-2026-002",
    patient: "Emma Johnson",
    date: "2026-02-23",
    service: "Occupational Therapy",
    status: "Accepted",
    assignedTo: "Dr. Sarah Mitchell",
    assignedFrom: "",
  },
  {
    id: "REF-2026-003",
    patient: "Michael Brown",
    date: "2026-02-22",
    service: "Psychology",
    status: "Accepted",
    assignedTo: "Dr. James Wilson",
    assignedFrom: "",
  },
  {
    id: "REF-2026-004",
    patient: "Sarah Davis",
    date: "2026-02-21",
    service: "Ergonomic Assessment",
    status: "Accepted",
    assignedTo: "Dr. Sarah Mitchell",
    assignedFrom: "",
  },
  {
    id: "REF-2026-005",
    patient: "Robert Wilson",
    date: "2026-02-20",
    service: "Health Surveillance",
    status: "Rejected",
    assignedTo: "",
    assignedFrom: "Dr. Emily Chen",
  },
];

export const PractitionerTestOverview = () => {
  const [search, setSearch] = useState("");
  const [referrals, setReferrals] = useState(initialReferrals);

  const filtered = referrals.filter(
    (r) =>
      r.patient.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  // Summary counts
  const summary = {
    pending: referrals.filter((r) => r.status === "Pending").length,
    assigned: referrals.filter((r) => r.status === "Accepted" && r.assignedFrom).length, 
    // accepted referrals that were sent to you
    accepted: referrals.filter((r) => r.status === "Accepted" && r.assignedTo).length, 
    // accepted referrals that already had assignedTo
  };

  const handleDecision = (id, decision) => {
    setReferrals((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: decision,
              assignedTo: decision === "Accepted" ? "You" : "", 
            }
          : r
      )
    );
    const referral = referrals.find((r) => r.id === id);
    alert(
      `Referral ${id} for ${referral.patient} (${referral.service}) has been ${decision}.`
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        Referral Management Overview
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-yellow-100 p-4 shadow">
          <h3 className="text-sm font-medium text-yellow-800">Pending Referrals</h3>
          <p className="text-2xl font-bold text-yellow-900">{summary.pending}</p>
        </div>
        <div className="rounded-lg bg-blue-100 p-4 shadow">
          <h3 className="text-sm font-medium text-blue-800">Assigned Referrals</h3>
          <p className="text-2xl font-bold text-blue-900">{summary.assigned}</p>
        </div>
        <div className="rounded-lg bg-green-100 p-4 shadow">
          <h3 className="text-sm font-medium text-green-800">Accepted Referrals</h3>
          <p className="text-2xl font-bold text-green-900">{summary.accepted}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search referrals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3 rounded border px-3 py-2 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Referral ID</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Patient Name</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Date Submitted</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Service Type</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Assigned To</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Assigned From</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2">{r.id}</td>
                <td className="px-4 py-2">{r.patient}</td>
                <td className="px-4 py-2">{r.date}</td>
                <td className="px-4 py-2">{r.service}</td>
                <td className="px-4 py-2">
                  {r.assignedFrom && r.status === "Pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(r.id, "Accepted")}
                        className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecision(r.id, "Rejected")}
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded ${
                        r.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : r.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{r.assignedTo || "-"}</td>
                <td className="px-4 py-2">{r.assignedFrom || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-4 py-2 text-sm text-gray-600">
          Showing {filtered.length} of {referrals.length} referrals
        </div>
      </div>
    </div>
  );
};