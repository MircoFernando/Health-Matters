import { useState } from "react";

export const PractitionerTestCreateReferral = () => {
  const [formData, setFormData] = useState({
    patientId: "",
    practitionerId: "",
    referralReason: "",
    serviceType: ""
  });

  const [errors, setErrors] = useState({});

  // Dummy data
  const patients = [
    { id: "P-1001", name: "John Smith" },
    { id: "P-1002", name: "Emma Johnson" },
    { id: "P-1003", name: "Michael Brown" },
    { id: "P-1004", name: "Sarah Davis" },
  ];

  const practitioners = [
    { id: "PR-2001", name: "Dr. Alan Parker" },
    { id: "PR-2002", name: "Dr. Sarah Mitchell" },
    { id: "PR-2003", name: "Dr. James Wilson" },
    { id: "PR-2004", name: "Dr. Emily Chen" },
  ];

  const serviceTypes = [
    { id: "S-3001", name: "Physiotherapy" },
    { id: "S-3002", name: "Occupational Therapy" },
    { id: "S-3003", name: "Psychology" },
    { id: "S-3004", name: "Ergonomic Assessment" },
    { id: "S-3005", name: "Health Surveillance" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.patientId || !patients.some(p => p.id === formData.patientId)) {
      newErrors.patientId = "Valid patient is required";
    }
    if (!formData.practitionerId || !practitioners.some(p => p.id === formData.practitionerId)) {
      newErrors.practitionerId = "Valid practitioner is required";
    }
    if (!formData.referralReason.trim()) {
      newErrors.referralReason = "Referral reason is required";
    }
    if (!formData.serviceType || !serviceTypes.some(s => s.id === formData.serviceType)) {
      newErrors.serviceType = "Valid service type is required";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Find names for IDs
    const patient = patients.find(p => p.id === formData.patientId);
    const practitioner = practitioners.find(p => p.id === formData.practitionerId);
    const service = serviceTypes.find(s => s.id === formData.serviceType);

    alert(
      `Referral Details:\n\n` +
      `Patient: ${patient?.name} (ID: ${patient?.id})\n` +
      `Practitioner: ${practitioner?.name} (ID: ${practitioner?.id})\n` +
      `Service Type: ${service?.name} (ID: ${service?.id})\n` +
      `Referral Reason: ${formData.referralReason}`
    );
  };

  const handleClear = () => {
    setFormData({
      patientId: "",
      practitionerId: "",
      referralReason: "",
      serviceType: ""
    });
    setErrors({});
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">Create Referral</h1>
      <p className="text-gray-500 mb-6">
        Complete all required fields to submit a patient referral
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-8 space-y-6 border"
      >
        {/* Patient Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2">Patient</label>
          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${
              errors.patientId ? "border-red-500" : ""
            }`}
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
          {errors.patientId && (
            <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
          )}
        </div>

        {/* Practitioner Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2">Practitioner</label>
          <select
            name="practitionerId"
            value={formData.practitionerId}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${
              errors.practitionerId ? "border-red-500" : ""
            }`}
          >
            <option value="">Select practitioner</option>
            {practitioners.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
          {errors.practitionerId && (
            <p className="text-red-500 text-sm mt-1">{errors.practitionerId}</p>
          )}
        </div>

        {/* Referral Reason */}
        <div>
          <label className="block text-sm font-medium mb-2">Referral Reason</label>
          <textarea
            name="referralReason"
            value={formData.referralReason}
            onChange={handleChange}
            rows="4"
            placeholder="Please provide detailed information about the reason for this referral..."
            className={`w-full border rounded-lg p-3 ${
              errors.referralReason ? "border-red-500" : ""
            }`}
          />
          {errors.referralReason && (
            <p className="text-red-500 text-sm mt-1">{errors.referralReason}</p>
          )}
        </div>

        {/* Service Type Dropdown */}
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${
              errors.serviceType ? "border-red-500" : ""
            }`}
          >
            <option value="">Select service type</option>
            {serviceTypes.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          {errors.serviceType && (
            <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="border px-5 py-2 rounded-lg text-gray-600"
          >
            Clear
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg"
          >
            Submit Referral
          </button>
        </div>
      </form>

      {/* Info box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 text-sm p-4 rounded-lg text-gray-600">
        * indicates required field. All patient information is handled in accordance with GDPR and healthcare data protection regulations.
      </div>
    </div>
  );
};