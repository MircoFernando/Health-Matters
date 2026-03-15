import React, { useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import {
  useGetAppointmentsByPractitionerIdQuery,
  useGetAvailableReferralsForPractitionerQuery,
  useUpdateReferralStatusMutation,
} from "../../../store/api";

export const PractitionerTestOverview = () => {
  const { user } = useUser();
  const [search, setSearch] = useState("");

  const {
    data: referrals = [],
    isLoading,
    isError,
    refetch,
  } = useGetAvailableReferralsForPractitionerQuery(undefined, { skip: !user?.id });

  const { data: appointments = [] } = useGetAppointmentsByPractitionerIdQuery(user?.id, {
    skip: !user?.id,
  });

  const [updateReferralStatus, { isLoading: isUpdating }] = useUpdateReferralStatusMutation();

  const patientNames = useMemo(() => {
    const map = new Map();
    appointments.forEach((appointment) => {
      if (appointment?.patientClerkUserId) {
        map.set(appointment.patientClerkUserId, appointment?.patient?.fullName || "Unknown");
      }
    });
    return map;
  }, [appointments]);

  const filtered = referrals.filter(
    (r) =>
      (patientNames.get(r.patientClerkUserId) || r.patientClerkUserId || "").toLowerCase().includes(search.toLowerCase()) ||
      String(r._id).toLowerCase().includes(search.toLowerCase()) ||
      String(r.serviceType || "").toLowerCase().includes(search.toLowerCase())
  );

  const summary = useMemo(
    () => ({
      pending: referrals.filter((r) => ["pending", "assigned"].includes(r.referralStatus)).length,
      rejected: referrals.filter((r) => r.referralStatus === "rejected").length,
      accepted: referrals.filter((r) => r.referralStatus === "accepted").length,
    }),
    [referrals]
  );

  const updateStatus = async (id, status) => {
    try {
      await updateReferralStatus({ referralId: id, referralStatus: status }).unwrap();
      refetch();
    } catch (error) {
      alert(error?.data?.message || "Unable to update referral status.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-slate-600">
        <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" /> Loading referrals...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-sm text-red-600">
        Unable to load practitioner referrals.
      </div>
    );
  }

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
          <h3 className="text-sm font-medium text-blue-800">Rejected Referrals</h3>
          <p className="text-2xl font-bold text-blue-900">{summary.rejected}</p>
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
              <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <tr key={r._id}>
                <td className="px-4 py-2">{String(r._id).slice(-8).toUpperCase()}</td>
                <td className="px-4 py-2">{patientNames.get(r.patientClerkUserId) || r.patientClerkUserId}</td>
                <td className="px-4 py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">{r.serviceType || "-"}</td>
                <td className="px-4 py-2">{r.referralStatus}</td>
                <td className="px-4 py-2">{r.practitionerClerkUserId || "-"}</td>
                <td className="px-4 py-2">
                  {["pending", "assigned"].includes(r.referralStatus) ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateStatus(r._id, "accepted")}
                        className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateStatus(r._id, "rejected")}
                        className="rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">No actions</span>
                  )}
                </td>
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