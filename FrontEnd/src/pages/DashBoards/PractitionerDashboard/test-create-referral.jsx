import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  useCreateReferralMutation,
  useGetServicesQuery,
  useGetUserDirectoryQuery,
} from "../../../store/api";

export const PractitionerTestCreateReferral = () => {
  const initialFormData = {
    patientId: "",
    practitionerId: "",
    referralReason: "",
    serviceType: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const { data: allUsers = [], isLoading: usersLoading } = useGetUserDirectoryQuery();
  const { data: practitioners = [], isLoading: practitionersLoading } = useGetUserDirectoryQuery({ role: "practitioner" });
  const { data: services = [], isLoading: servicesLoading } = useGetServicesQuery();

  const [createReferral, { isLoading: isSubmitting }] = useCreateReferralMutation();

  const patientOptions = useMemo(
    () => allUsers.map((user) => ({
      id: user.clerkUserId,
      label: `${[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Unknown"} (${user.role || "unknown"})`,
    })),
    [allUsers]
  );

  const practitionerOptions = useMemo(
    () => practitioners.map((user) => ({
      id: user.clerkUserId,
      label: `${[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Unknown"} (${user.role || "practitioner"})`,
    })),
    [practitioners]
  );

  const serviceOptions = useMemo(
    () => services.map((service) => ({
      id: service.name || service._id,
      value: service.name || service._id,
      label: `${service.name || "Service"}${service.price ? ` - ${service.price}` : ""}`,
    })),
    [services]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      server: "",
    }));
    setSuccessMessage("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.patientId) nextErrors.patientId = "Patient is required";
    if (!formData.practitionerId) nextErrors.practitionerId = "Practitioner is required";
    if (!formData.referralReason.trim()) nextErrors.referralReason = "Referral reason is required";
    if (!formData.serviceType) nextErrors.serviceType = "Service type is required";

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createReferral({
        patientClerkUserId: formData.patientId,
        practitionerClerkUserId: formData.practitionerId,
        referralReason: formData.referralReason.trim(),
        serviceType: formData.serviceType,
      }).unwrap();

      setSuccessMessage("Referral submitted successfully.");
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      setErrors({ server: error?.data?.message || "Unable to submit referral." });
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    setSuccessMessage("");
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">Create Referral</h1>
      <p className="text-gray-500 mb-6">
        Complete all required fields to submit a patient referral
      </p>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-8 space-y-6 border">
        {errors.server && <p className="text-sm text-red-600">{errors.server}</p>}
        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

        <div>
          <label className="block text-sm font-medium mb-2">Patient</label>
          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${errors.patientId ? "border-red-500" : ""}`}
            disabled={usersLoading}
          >
            <option value="">{usersLoading ? "Loading users..." : "Select patient"}</option>
            {patientOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.label}
              </option>
            ))}
          </select>
          {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Practitioner</label>
          <select
            name="practitionerId"
            value={formData.practitionerId}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${errors.practitionerId ? "border-red-500" : ""}`}
            disabled={practitionersLoading}
          >
            <option value="">{practitionersLoading ? "Loading practitioners..." : "Select practitioner"}</option>
            {practitionerOptions.map((practitioner) => (
              <option key={practitioner.id} value={practitioner.id}>
                {practitioner.label}
              </option>
            ))}
          </select>
          {errors.practitionerId && <p className="text-red-500 text-sm mt-1">{errors.practitionerId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Referral Reason</label>
          <textarea
            name="referralReason"
            value={formData.referralReason}
            onChange={handleChange}
            rows="4"
            placeholder="Please provide detailed information about the reason for this referral..."
            className={`w-full border rounded-lg p-3 ${errors.referralReason ? "border-red-500" : ""}`}
          />
          {errors.referralReason && <p className="text-red-500 text-sm mt-1">{errors.referralReason}</p>}
        </div>

        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${errors.serviceType ? "border-red-500" : ""}`}
            disabled={servicesLoading}
          >
            <option value="">{servicesLoading ? "Loading services..." : "Select service type"}</option>
            {serviceOptions.map((service) => (
              <option key={service.id} value={service.value}>
                {service.label}
              </option>
            ))}
          </select>
          {errors.serviceType && <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" className="border px-5 py-2 rounded-lg text-gray-600" onClick={handleCancel}>
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Referral
          </button>
        </div>
      </form>

      <div className="mt-6 bg-blue-50 border border-blue-200 text-sm p-4 rounded-lg text-gray-600">
        * indicates required field. All patient information is handled in accordance with GDPR and healthcare data protection regulations.
      </div>
    </div>
  );
};
