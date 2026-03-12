"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAppointmentAssigned = exports.rejectAppointmentFromReferral = exports.confirmAppointmentFromReferral = exports.assignAppointmentToPractitioner = exports.createPendingAppointmentForReferral = void 0;
const Appointment_1 = require("../models/Appointment");
const Notification_1 = require("../models/Notification");
const getNotificationRecipient = (referral) => referral.submittedByClerkUserId || referral.patientClerkUserId;
const createPendingAppointmentForReferral = async (referral) => {
    const appointmentStatus = referral.practitionerClerkUserId ? 'assigned' : 'pending';
    return Appointment_1.Appointment.findOneAndUpdate({ referralId: referral._id }, {
        $set: {
            patientClerkUserId: referral.patientClerkUserId,
            submittedByClerkUserId: referral.submittedByClerkUserId,
            practitionerClerkUserId: referral.practitionerClerkUserId,
            assignedByClerkUserId: referral.assignedbyClerkUserId,
            serviceType: referral.serviceType,
            referralReason: referral.referralReason,
            notes: referral.notes,
            status: appointmentStatus,
            assignmentSource: referral.assignedbyClerkUserId ? 'admin' : 'referral',
        },
        $setOnInsert: {
            assignedDate: referral.practitionerClerkUserId ? new Date() : undefined,
        },
    }, {
        new: true,
        upsert: true,
        runValidators: true,
    });
};
exports.createPendingAppointmentForReferral = createPendingAppointmentForReferral;
const assignAppointmentToPractitioner = async ({ referral, practitionerClerkUserId, assignedByClerkUserId, }) => {
    return Appointment_1.Appointment.findOneAndUpdate({ referralId: referral._id }, {
        $set: {
            patientClerkUserId: referral.patientClerkUserId,
            submittedByClerkUserId: referral.submittedByClerkUserId,
            practitionerClerkUserId,
            assignedByClerkUserId,
            serviceType: referral.serviceType,
            referralReason: referral.referralReason,
            notes: referral.notes,
            assignmentSource: 'admin',
            status: 'assigned',
            assignedDate: new Date(),
        },
    }, {
        new: true,
        upsert: true,
        runValidators: true,
    });
};
exports.assignAppointmentToPractitioner = assignAppointmentToPractitioner;
const confirmAppointmentFromReferral = async ({ referral, practitionerClerkUserId, }) => {
    const appointment = await Appointment_1.Appointment.findOneAndUpdate({ referralId: referral._id }, {
        $set: {
            patientClerkUserId: referral.patientClerkUserId,
            submittedByClerkUserId: referral.submittedByClerkUserId,
            practitionerClerkUserId,
            serviceType: referral.serviceType,
            referralReason: referral.referralReason,
            notes: referral.notes,
            status: 'confirmed',
            confirmedDate: new Date(),
        },
    }, {
        new: true,
        upsert: true,
        runValidators: true,
    });
    await Notification_1.Notification.create({
        recipientClerkUserId: getNotificationRecipient(referral),
        type: 'appointment_confirmed',
        title: 'Appointment confirmed',
        message: `${referral.serviceType || 'Your referral'} has been accepted and the appointment is now confirmed.`,
        relatedEntityType: 'appointment',
        relatedEntityId: appointment._id,
    });
    return appointment;
};
exports.confirmAppointmentFromReferral = confirmAppointmentFromReferral;
const rejectAppointmentFromReferral = async ({ referral, practitionerClerkUserId, }) => {
    return Appointment_1.Appointment.findOneAndUpdate({ referralId: referral._id }, {
        $set: {
            patientClerkUserId: referral.patientClerkUserId,
            submittedByClerkUserId: referral.submittedByClerkUserId,
            practitionerClerkUserId,
            serviceType: referral.serviceType,
            referralReason: referral.referralReason,
            notes: referral.notes,
            status: 'rejected',
            rejectedDate: new Date(),
        },
    }, {
        new: true,
        upsert: true,
        runValidators: true,
    });
};
exports.rejectAppointmentFromReferral = rejectAppointmentFromReferral;
const notifyAppointmentAssigned = async ({ referral, appointmentId, practitionerClerkUserId, }) => {
    return Notification_1.Notification.create({
        recipientClerkUserId: practitionerClerkUserId,
        type: 'appointment_assigned',
        title: 'New appointment assignment',
        message: `${referral.serviceType || 'A referral'} has been assigned to you and is waiting for your response.`,
        relatedEntityType: 'appointment',
        relatedEntityId: appointmentId,
    });
};
exports.notifyAppointmentAssigned = notifyAppointmentAssigned;
