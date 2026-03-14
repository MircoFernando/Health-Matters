import express from "express";
import { getAppointmentsByEmployeeId } from "../controllers/appointmentController";
import { requireClerkAuth } from "../middlewares/auth-middleware";

const router = express.Router();

router.use(requireClerkAuth);

router.get("/employee/:employeeId", getAppointmentsByEmployeeId);

export default router;