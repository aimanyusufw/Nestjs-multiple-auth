export class SignupUserDto {
  email: string;
  password: string;
  confirmPassword: string;
}

export class SigninUserDto {
  uid: string;
  password: string;
}

export class UserResponse {
  name: string;
  username: string;
  email: string;
  tokens?: Object;
}

export class JwtPayload {
  sub: string;
  name: string;
  username: string;
  email: string;
}
