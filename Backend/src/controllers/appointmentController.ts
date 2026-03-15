import Appointment from "../models/Appointment";
import { User } from "../models/User";
import { Request, Response } from "express";
import { getAuth } from "@clerk/express";

/*
 Team C - Employee appointment timeline retrieval (TMC-003) . Done by Vinuki and Senuthi, and Tharusha
 Team E - Employee dashboard upcoming appointments metric support (TME-003) . Done by Methmi
 Team G - Practitioner appointment list, responses, cancellation, and performance counters support (TMG-001, TMG-003, TMG-004) . Done by Charin, Helika, and Vinuli
*/

const toPractitionerView = (appointment: any) => {
  const referral = appointment.referralId && typeof appointment.referralId === "object" ? appointment.referralId : null;
  const normalizedStatus = appointment.status === "scheduled" ? "assigned" : appointment.status;

  return {
    ...appointment,
    status: normalizedStatus,
    patientClerkUserId: appointment.employeeId,
    assignedByClerkUserId: appointment.assignedByClerkUserId || null,
    assignmentSource: appointment.assignmentSource || "admin",
    serviceType: appointment.serviceType || referral?.serviceType || null,
    referralReason: appointment.referralReason || referral?.referralReason || null,
  };
};

const loadPractitionerAppointments = async (practitionerId: string) => {
  const appointments = await Appointment.find({ practitionerId })
    .populate("referralId", "serviceType referralReason")
    .sort({ createdAt: -1 })
    .lean();

  const patientClerkUserIds = [...new Set(appointments.map((appointment: any) => appointment.employeeId).filter(Boolean))];
  const patientUsers = await User.find({ clerkUserId: { $in: patientClerkUserIds } })
    .select("clerkUserId firstName lastName email phone department")
    .lean();

  const patientMap = new Map(patientUsers.map((patient: any) => [patient.clerkUserId, patient]));

  return appointments.map((appointment: any) => {
    const mapped = toPractitionerView(appointment);
    const patient = patientMap.get(mapped.patientClerkUserId);

    return {
      ...mapped,
      patient: patient
        ? {
            clerkUserId: patient.clerkUserId,
            firstName: patient.firstName || "",
            lastName: patient.lastName || "",
            fullName: `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "Unknown",
            email: patient.email || "",
            phone: patient.phone || "",
            department: patient.department || "",
          }
        : {
            clerkUserId: mapped.patientClerkUserId,
            firstName: "",
            lastName: "",
            fullName: "Unknown",
            email: "",
            phone: "",
            department: "",
          },
    };
  });
};

// Get appointments for an employee (patient timeline)

export const getAppointmentsByEmployeeId = async (
  req: Request,
  res: Response
) => {

  try {

    const { employeeId } = req.params;

    const appointments = await Appointment.find({
      employeeId
    })
      .populate("practitionerId", "firstName lastName")
      .sort({ scheduledDate: -1 });

    res.status(200).json(appointments);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch appointments",
      error
    });

  }

};

export const getAppointmentsByPractitionerId = async (req: Request, res: Response) => {
  try {
    const { practitionerId } = req.params;

    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (auth.userId !== practitionerId) {
      return res.status(403).json({ message: "You can only access your own appointments" });
    }

    const practitionerView = await loadPractitionerAppointments(practitionerId);

    res.status(200).json(practitionerView);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch practitioner appointments",
      error,
    });
  }
};

export const getMyPractitionerAppointments = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const practitionerView = await loadPractitionerAppointments(auth.userId);

    res.status(200).json(practitionerView);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch practitioner appointments",
      error,
    });
  }
};

export const respondToAppointment = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { appointmentId } = req.params;
    const { status } = req.body as { status?: string };

    if (!status || !["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be confirmed or rejected" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (String(appointment.practitionerId) !== auth.userId) {
      return res.status(403).json({ message: "You can only update your own appointments" });
    }

    if (status === "confirmed") {
      appointment.status = "confirmed";
    } else {
      appointment.status = "cancelled";
      appointment.cancellationReason = "Rejected by practitioner";
      appointment.cancelledAt = new Date();
    }

    await appointment.save();

    const updated = await Appointment.findById(appointmentId)
      .populate("referralId", "serviceType referralReason")
      .lean();

    res.status(200).json(toPractitionerView(updated));
  } catch (error) {
    res.status(500).json({ message: "Failed to respond to appointment", error });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (String(appointment.practitionerId) !== auth.userId) {
      return res.status(403).json({ message: "You can only cancel your own appointments" });
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = "Cancelled by practitioner";
    appointment.cancelledAt = new Date();
    await appointment.save();

    const updated = await Appointment.findById(appointmentId)
      .populate("referralId", "serviceType referralReason")
      .lean();

    res.status(200).json(toPractitionerView(updated));
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel appointment", error });
  }
};