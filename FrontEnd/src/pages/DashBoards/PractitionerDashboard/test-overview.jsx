import React, { useState, useEffect } from "react";
import { useGetReferralsQuery } from "@/store/api";

export const PractitionerTestOverview = () => {
  const [search, setSearch] = useState("");

  const {
    data: referrals = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetReferralsQuery();

  const [localReferrals, setLocalReferrals] = useState([]);

  // Sync local state with API data
  useEffect(() => {
    if (referrals?.length) {
      setLocalReferrals(referrals);
    }
  }, [referrals]);

  // Filter by patient ID or referral ID
  const filtered = localReferrals.filter(
    (r) =>
      r.patientClerkUserId?.toLowerCase().includes(search.toLowerCase()) ||
      r._id?.toLowerCase().includes(search.toLowerCase())
  );

  // Summary counts
  const summary = {
    pending: localReferrals.filter((r) => r.referralStatus === "pending").length,
    assigned: localReferrals.filter(
      (r) => r.referralStatus === "accepted" && r.assignedByClerkUserId
    ).length,
    accepted: localReferrals.filter(
      (r) => r.referralStatus === "accepted" && r.practitionerClerkUserId
    ).length,
  };

  // Accept/Reject logic
  const handleDecision = (id, decision) => {
    setLocalReferrals((prev) =>
      prev.map((r) =>
        r._id === id
          ? {
              ...r,
              referralStatus: decision.toLowerCase(),
              practitionerClerkUserId: decision === "Accepted" ? "You" : null,
              acceptedDate: decision === "Accepted" ? new Date() : r.acceptedDate,
              rejectedDate: decision === "Rejected" ? new Date() : r.rejectedDate,
            }
          : r
      )
    );
    const referral = localReferrals.find((r) => r._id === id);
    alert(
      `Referral ${id} for patient ${referral.patientClerkUserId} (${referral.serviceType}) has been ${decision}.`
    );
  };

  if (isLoading) return <p className="p-8">Loading referrals...</p>;
  if (isError) return <p className="p-8 text-red-600">Error: {error?.message}</p>;

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
              <th className="px-4 py-2 text-left font-medium text-gray-700">Patient Clerk ID</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Date Submitted</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Service Type</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Assigned To</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Assigned From</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <tr key={r._id}>
                <td className="px-4 py-2">{r._id}</td>
                <td className="px-4 py-2">{r.patientClerkUserId}</td>
                <td className="px-4 py-2">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{r.serviceType}</td>
                <td className="px-4 py-2">
                  {!r.practitionerClerkUserId && r.referralStatus === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(r._id, "Accepted")}
                        className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecision(r._id, "Rejected")}
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded ${
                        r.referralStatus === "accepted"
                          ? "bg-green-100 text-green-800"
                          : r.referralStatus === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {r.referralStatus}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{r.practitionerClerkUserId || "-"}</td>
                <td className="px-4 py-2">{r.assignedByClerkUserId || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-4 py-2 text-sm text-gray-600">
          Showing {filtered.length} of {localReferrals.length} referrals
        </div>
      </div>
    </div>
  );
};