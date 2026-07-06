import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Database } from './db';
import { User } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'movie-ticket-booking-fallback-secret-9876543210';

export interface AuthenticatedRequest extends Request {
  user?: Omit<User, 'password'>;
}

export function generateToken(user: Omit<User, 'password'>): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    const user = Database.findOne('users', u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Exclude password from the request's user object
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  });
}

export function isAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
  next();
}
