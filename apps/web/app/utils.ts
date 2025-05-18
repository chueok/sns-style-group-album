import assert from 'assert';

export const getBackendUrl = (): string => {
  const backendServerUri = process.env.NEXT_PUBLIC_BACKEND_SERVER_URI;
  assert(
    typeof backendServerUri === 'string',
    'environment variable "NEXT_PUBLIC_BACKEND_SERVER_URI" is not set'
  );

  return backendServerUri;
};
