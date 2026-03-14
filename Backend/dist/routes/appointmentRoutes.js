"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appointmentController_1 = require("../controllers/appointmentController");
const auth_middleware_1 = require("../middlewares/auth-middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.requireClerkAuth);
router.get("/employee/:employeeId", appointmentController_1.getAppointmentsByEmployeeId);
exports.default = router;
