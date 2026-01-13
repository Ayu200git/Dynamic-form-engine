import { Request, Response, NextFunction } from 'express';

export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // req.user.role can be a Populate object or an ID or string name depending on how we saved/populated it.
        // Ideally, in the JWT payload we should store the role NAME, or we fetch the user and populate role.
        // For this implementation, I will assume the JWT payload contains the populated role name or I fetch it.
        // Let's assume req.user.role in JWT is the role NAME for simplicity and performance, 
        // OR we populate it in the protect middleware if we want to be safe. 

        // BUT, the JWT payload usually is minimal. 
        // Let's assume the authService puts the role object { name: 'ADMIN' } or just the name into the token.
        // In my type IUser, role is string | IRole.

        const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role.name;

        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }

        next();
    };
};
