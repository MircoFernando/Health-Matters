import { useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import { useGetAppointmentsByPractitionerIdQuery } from "../../../store/api";

export const PractitionerTestPatients = () => {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useGetAppointmentsByPractitionerIdQuery(user?.id, { skip: !user?.id });

  const patients = useMemo(() => {
    const grouped = new Map();

    appointments.forEach((appointment) => {
      const patient = appointment?.patient || {};
      const clerkUserId = appointment?.patientClerkUserId || patient?.clerkUserId;
      if (!clerkUserId) {
        return;
      }

      const fullName = patient?.fullName || `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim() || "Unknown";

      if (!grouped.has(clerkUserId)) {
        grouped.set(clerkUserId, {
          id: clerkUserId,
          name: fullName,
          email: patient?.email || "",
          phone: patient?.phone || "",
          department: patient?.department || "",
          totalAppointments: 0,
          latestAppointmentDate: null,
          latestServiceType: "",
          latestReferralReason: "",
          latestStatus: "Active",
        });
      }

      const current = grouped.get(clerkUserId);
      current.totalAppointments += 1;

      const scheduledDate = appointment?.scheduledDate ? new Date(appointment.scheduledDate) : null;
      if (scheduledDate && (!current.latestAppointmentDate || scheduledDate > current.latestAppointmentDate)) {
        current.latestAppointmentDate = scheduledDate;
        current.latestServiceType = appointment?.serviceType || "-";
        current.latestReferralReason = appointment?.referralReason || "-";
        current.latestStatus = appointment?.status === "cancelled" ? "Inactive" : "Active";
      }
    });

    return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [appointments]);

  const filteredPatients = patients.filter((patient) =>
    [patient.name, patient.id, patient.email, patient.department]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPatients = patients.length;
  const activePatients = patients.filter((patient) => patient.latestStatus === "Active").length;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newPatients = patients.filter(
    (patient) => patient.latestAppointmentDate && patient.latestAppointmentDate >= thirtyDaysAgo
  ).length;

  const handleReport = (patient) => {
    const reportText = [
      "Health Matters Patient Report",
      `Patient ID: ${patient.id}`,
      `Patient Name: ${patient.name}`,
      `Email: ${patient.email || "-"}`,
      `Phone: ${patient.phone || "-"}`,
      `Department: ${patient.department || "-"}`,
      `Latest Service: ${patient.latestServiceType || "-"}`,
      `Latest Referral Reason: ${patient.latestReferralReason || "-"}`,
      `Appointments Count: ${patient.totalAppointments}`,
      `Latest Appointment: ${patient.latestAppointmentDate ? patient.latestAppointmentDate.toLocaleString() : "-"}`,
    ].join("\n");

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${patient.id}-report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-slate-600">
        <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" /> Loading patients...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-sm text-red-600">
        Unable to load practitioner patients.
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Patient Statistics</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500 text-sm">Total Patients</p>
          <p className="text-2xl font-bold">{totalPatients}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500 text-sm">Active Patients</p>
          <p className="text-2xl font-bold">{activePatients}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500 text-sm">New Patients</p>
          <p className="text-2xl font-bold">{newPatients}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Patient List</h2>

      <input
        type="text"
        placeholder="Search patients..."
        className="border p-2 rounded w-80 mb-6"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Patient ID</th>
              <th className="p-3">Patient Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Last Service</th>
              <th className="p-3">Last Visit</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="border-t">
                <td className="p-3 font-mono text-xs">{patient.id}</td>
                <td className="p-3">{patient.name}</td>
                <td className="p-3">{patient.email || "-"}</td>
                <td className="p-3">{patient.phone || "-"}</td>
                <td className="p-3">{patient.latestServiceType || "-"}</td>
                <td className="p-3">{patient.latestAppointmentDate ? patient.latestAppointmentDate.toLocaleDateString() : "-"}</td>
                <td className="p-3">{patient.latestStatus}</td>
                <td className="p-3 space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    View
                  </button>

                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => handleReport(patient)}
                  >
                    Report
                  </button>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td className="p-6 text-center text-sm text-gray-500" colSpan={8}>
                  No patients found for this practitioner.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-125 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Patient Details</h2>
              <button className="text-xl" onClick={() => setSelectedPatient(null)}>
                x
              </button>
            </div>

            <div className="space-y-1 text-gray-700">
              <p><b>Name:</b> {selectedPatient.name}</p>
              <p><b>Patient ID:</b> {selectedPatient.id}</p>
              <p><b>Email:</b> {selectedPatient.email || "-"}</p>
              <p><b>Phone:</b> {selectedPatient.phone || "-"}</p>
              <p><b>Department:</b> {selectedPatient.department || "-"}</p>
              <p><b>Appointments Count:</b> {selectedPatient.totalAppointments}</p>
              <p><b>Last Service:</b> {selectedPatient.latestServiceType || "-"}</p>
              <p><b>Last Visit:</b> {selectedPatient.latestAppointmentDate ? selectedPatient.latestAppointmentDate.toLocaleString() : "-"}</p>
            </div>

            <div className="flex justify-end mt-4">
              <button className="border px-4 py-2 rounded" onClick={() => setSelectedPatient(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
