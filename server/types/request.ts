import { Request } from 'express';

type AuthorizedRequest<T> = Request<never, never, T> & {
  user?: string;
};

export default AuthorizedRequest;
