// Type definitions for auth handlers
import type { VercelRequest, VercelResponse } from '@vercel/node';

export function handleRegister(req: VercelRequest | any, res: VercelResponse | any): Promise<void>;
export function handleLogin(req: VercelRequest | any, res: VercelResponse | any): Promise<void>;
export function handleForgotPassword(req: VercelRequest | any, res: VercelResponse | any): Promise<void>;
export function handleResetPassword(req: VercelRequest | any, res: VercelResponse | any): Promise<void>;
export function handleGetProfile(req: VercelRequest | any, res: VercelResponse | any): Promise<void>;
export function handleUpdateProfile(req: VercelRequest | any, res: VercelResponse | any): Promise<void>;
export function handleChangePassword(req: VercelRequest | any, res: VercelResponse | any): Promise<void>;

