export const getBackendUrl = (): string => {
  const backendServerUri = process.env.NEXT_PUBLIC_BACKEND_SERVER_URI;

  if (typeof backendServerUri !== 'string') {
    throw new Error(
      'environment variable "NEXT_PUBLIC_BACKEND_SERVER_URI" is not set'
    );
  }

  return backendServerUri;
};
