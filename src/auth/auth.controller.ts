import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SigninUserDto, SignupUserDto, UserResponse } from './dto/user.dto';
import { AccessTokenGuard } from './guard/accessToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  //   Built in Logger
  private readonly logger = new Logger(AuthService.name);

  @Post('signup')
  async userSignup(
    @Res() res: Response,
    @Body() user: SignupUserDto,
  ): Promise<Response> {
    try {
      // Waiting auth service response
      const result = await this.authService.userSignup(user);

      // Create and Log response data
      const response = res.status(200).json({ data: result });
      this.logger.log(
        `User signup response | statusCode : ${response.statusCode} | payload :  ${JSON.stringify(result)}`,
      );

      // Return response
      return response;
    } catch (error) {
      // log the error response
      this.logger.warn(
        `Signup user response | statusCode : ${error.status} | payload : ${JSON.stringify(error)}`,
      );

      // Return error response
      return res.status(error.status).json({
        error: true,
        message: error.message,
      });
    }
  }

  @Post('signin')
  async userSignin(
    @Res() res: Response,
    @Body() data: SigninUserDto,
  ): Promise<Response> {
    try {
      // Waiting auth service response
      const result = await this.authService.userSignin(data);

      // Create and Log response data
      const response = res.status(200).json({ data: result });
      this.logger.log(
        `User signin response | statusCode : ${response.statusCode} | payload :  ${JSON.stringify(result)}`,
      );

      // Return response
      return response;
    } catch (error) {
      // log the error response
      this.logger.warn(
        `Signin user response | statusCode : ${error.status} | payload : ${JSON.stringify(error)}`,
      );

      // Return error response
      return res.status(error.status).json({
        error: true,
        message: error.message,
      });
    }
  }

  @Get('profile')
  @UseGuards(AccessTokenGuard)
  async getUserProfile(@Req() req, @Res() res: Response): Promise<any> {
    try {
      // Waiting auth service response
      const result = req.user;

      // Create and Log response data
      const response = res.status(200).json({
        data: {
          name: result.name,
          username: result.username,
          email: result.email,
        },
      });
      this.logger.log(
        `User get profile response | statusCode : ${response.statusCode} | payload :  ${JSON.stringify(result)}`,
      );

      // Return response
      return response;
    } catch (error) {
      // log the error response
      this.logger.warn(
        `Get profile user response | statusCode : ${error.status} | payload : ${JSON.stringify(error)}`,
      );

      // Return error response
      return res.status(error.status).json({
        error: true,
        message: error.message,
      });
    }
  }

  @Delete('signout')
  @UseGuards(AccessTokenGuard)
  async userSignout(@Req() req, @Res() res: Response) {
    try {
      // get user from request
      const user = req.user;

      // Waiting auth service to proccess
      const result = await this.authService.userSignout(user);

      // create and log response data
      const response = res.status(200).json({ message: result });
      this.logger.log(
        `User signout response | statusCode : ${response.statusCode} | payload :  ${JSON.stringify(result)}`,
      );

      return response;
    } catch (error) {
      // log the error response
      this.logger.warn(
        `Signout user response | statusCode : ${error.status} | payload : ${JSON.stringify(error)}`,
      );

      // Return error response
      return res.status(error.status).json({
        error: true,
        message: error.message,
      });
    }
  }
}
