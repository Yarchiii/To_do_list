export type IJWTPayloadCreate = {
  userId: string;
}

export type IJWTPayload = IJWTPayloadCreate & {
  iat: number;
  exp: number;
};
