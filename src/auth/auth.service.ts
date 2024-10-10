import { HttpException, Injectable, Logger } from '@nestjs/common';
import {
  JwtPayload,
  SigninUserDto,
  SignupUserDto,
  UserResponse,
} from './dto/user.dto';
import { PrismaService } from 'src/libs/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  //   Built in Logger
  private readonly logger = new Logger(AuthService.name);

  async userSignup(data: SignupUserDto): Promise<UserResponse> {
    // log the request
    this.logger.log(`Create user request | request : ${JSON.stringify(data)}`);

    // Destructuring  data
    let { email, password, confirmPassword } = data;

    // Confirm password and confirm password are same
    if (password !== confirmPassword)
      throw new HttpException(
        'Your password and confirmation password do not match.',
        400,
      );

    // Check user is exsits
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (user) throw new HttpException('User is already exists', 409);

    // Hash the password
    password = await bcrypt.hash(password, 12);

    // Create user
    user = await this.prisma.user.create({
      data: {
        username: `user${Math.ceil(Math.random() * 999999)}`,
        email: email,
        password: password,
      },
    });

    // Generate tokens
    const tokens = await this.generateToken({
      sub: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    });

    // retunn data user created
    return {
      name: user.name,
      username: user.username,
      email: user.email,
      tokens: tokens,
    };
  }

  async userSignin(data: SigninUserDto): Promise<UserResponse> {
    // log the request
    this.logger.log(`User singin request | request : ${JSON.stringify(data)}`);

    // Destructuring  data
    const { uid, password } = data;

    // Chechk if user exsits
    const user = await this.prisma.user.findUnique({
      where: { email: uid },
    });

    // Throw error is invalid
    if (!user) throw new HttpException('Invalid credentials', 401);

    /// Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 401);
    }

    const tokens = await this.generateToken({
      sub: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    });

    // retunn data user created
    return {
      name: user.name,
      username: user.username,
      email: user.email,
      tokens: tokens,
    };
  }

  async userSignout(payload: JwtPayload) {
    // Update user refresh token with null
    const user = await this.prisma.user.update({
      where: { id: payload.sub },
      data: { refresh_token: null },
    });

    // Validate user is notfound
    if (!user) throw new HttpException('User not found', 404);

    // return the succes message
    return { message: 'Signout successfully' };
  }

  async generateToken(payload: JwtPayload) {
    // generate access and refresh tokens
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Update refresh token in database
    await this.prisma.user.update({
      where: { email: payload.email },
      data: { refresh_token },
    });

    // return the tokens
    return { access_token, refresh_token };
  }
}
