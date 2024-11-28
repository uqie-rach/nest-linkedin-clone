import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'contracts/enum/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from the custom decorator
    const requiredRoles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles) {
      console.log('[RoleGuard] No roles, access granted');
      return true; // No roles required, grant access
    }
    
    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;
        
    if (!user || !user.role) {
      console.log('[RoleGuard] Missing payload');
      throw new ForbiddenException('Access denied');
    }
    
    // Check if the user's role matches any of the required roles
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      console.log(`[RoleGuard] ${requiredRoles} required, but user has ${user.role}`);
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
