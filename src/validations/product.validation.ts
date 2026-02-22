import Joi from 'joi';
import { NextRequest, NextResponse } from 'next/server';

type ValidationResult = {
  error?: string;
};

export const validateAddProductModel = (body: any): ValidationResult => {
  const schema = Joi.object({
    modelName: Joi.string().trim().min(2).required(),
    status: Joi.string().valid('Padding', 'Live').optional(),
  });

  const { error } = schema.validate(body);

  if (error) {
    return { error: error.details[0].message };
  }

  return {};
};
