import { NextFunction, Request, Response } from 'express';
import { Referral } from '../models/Referral';
import { ZodError } from 'zod';
import {
	createReferralBodySchema,
	patientIdParamsSchema,
	practitionerIdParamsSchema,
	updateReferralBodySchema,
} from '../Dtos/referral.dto';
import { ValidationError, NotFoundError } from '../errors/errors';

const formatValidationErrors = (error: ZodError) =>
	error.issues.map((issue) => ({
		field: issue.path.join('.'),
		message: issue.message,
	}));

export const getAllReferrals = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const referrals = await Referral.find().sort({ createdAt: -1 });
		res.status(200).json(referrals);
	} catch (error) {
		next(error);
	}
};

export const getReferralsByPatientId = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsedParams = patientIdParamsSchema.safeParse(req.params);

		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const { patientId } = parsedParams.data;

		const referrals = await Referral.find({ patientClerkUserId: patientId }).sort({ createdAt: -1 });
		res.status(200).json(referrals);
	} catch (error) {
		next(error);
	}
};

export const getReferralsByPractitionerId = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsedParams = practitionerIdParamsSchema.safeParse(req.params);

		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const { practitionerId } = parsedParams.data;

		const referrals = await Referral.find({ practitionerClerkUserId: practitionerId }).sort({ createdAt: -1 });
		res.status(200).json(referrals);
	} catch (error) {
		next(error);
	}
};

export const createReferral = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsedBody = createReferralBodySchema.safeParse(req.body);

		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const newReferral = await Referral.create(parsedBody.data);

		res.status(201).json(newReferral);
	} catch (error) {
		next(error);
	}
};

export const updateReferralByPatientId = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsedParams = patientIdParamsSchema.safeParse(req.params);
		const parsedBody = updateReferralBodySchema.safeParse(req.body);

		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const { patientId } = parsedParams.data;

		const updateResult = await Referral.updateMany(
			{ patientClerkUserId: patientId },
			{ $set: parsedBody.data },
			{ runValidators: true }
		);

		if (updateResult.matchedCount === 0) {
			throw new NotFoundError('No referrals found for this patientId');
		}

		const updatedReferrals = await Referral.find({ patientClerkUserId: patientId }).sort({ createdAt: -1 });
		res.status(200).json({
			message: 'Referrals updated successfully',
			modifiedCount: updateResult.modifiedCount,
			referrals: updatedReferrals,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteReferralByPatientId = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsedParams = patientIdParamsSchema.safeParse(req.params);

		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const { patientId } = parsedParams.data;

		const deleteResult = await Referral.deleteMany({ patientClerkUserId: patientId });

		if (deleteResult.deletedCount === 0) {
			throw new NotFoundError('No referrals found for this patientId');
		}

		res.status(200).json({
			message: 'Referrals deleted successfully',
			deletedCount: deleteResult.deletedCount,
		});
	} catch (error) {
		next(error);
	}
};
