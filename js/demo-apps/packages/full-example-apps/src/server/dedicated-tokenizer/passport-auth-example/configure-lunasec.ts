import { LunaSec } from '@lunasec/node-sdk';

import { lunaSecSessionIdProvider } from './auth';

if (!process.env.SECURE_FRAME_URL) {
  throw new Error('Secure frame url env var is not set');
}

export const lunaSec = new LunaSec({
  secureFrameURL: process.env.SECURE_FRAME_URL,
  baseURL: '/api',
  auth: {
    secrets: { source: 'environment' },
    payloadClaims: [],
    // Provide a small middleware(ours is called readSessionFromRequest) that takes in the req object and returns a promise containing a session token
    // or null if a user is not logged in.  LunaSec uses this to automatically create and verify token grants
    sessionIdProvider: lunaSecSessionIdProvider,
  },
});