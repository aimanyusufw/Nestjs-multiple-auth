import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  //   Built in Logger
  private readonly logger = new Logger(AccessTokenGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const errorInvalidToken = new HttpException('Invalid access token', 401);

    // Log warning if token is missing
    if (!token) {
      this.logger.warn(
        `Authorization failed | statusCode: ${errorInvalidToken.getStatus()} | message: ${errorInvalidToken.message}`,
      );
      throw errorInvalidToken;
    }

    try {
      // Verify the token using the secret key
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attach user info to the request object
      request['user'] = payload;
    } catch (err) {
      // Log the error if token verification fails
      this.logger.warn(
        `Token verification failed | statusCode: ${errorInvalidToken.getStatus()} | message: ${errorInvalidToken.message}`,
      );
      throw errorInvalidToken;
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    this.logger.log(
      `User access token auth guard request | method: ${request.method} | url: ${request.url} | headers : ${JSON.stringify(request.headers)}`,
    );
    return type === 'Bearer' ? token : undefined;
  }
}
