import { Request } from 'express';
import { TokenPayload } from './index';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export interface RequestWithFiles extends AuthenticatedRequest {
  files?: Express.Multer.File[];
}

export interface QueryParams {
  page?: string;
  limit?: string;
  [key: string]: string | undefined;
}