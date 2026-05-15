'use server';

import { auth } from '../auth';

export const signUp = async (email: string, name: string, password: string) => {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      name,
      password,
    },
  });
  return result;
};
