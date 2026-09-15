export interface DecodedUserData {
  email?: string;
  name?: string;
  role?: string | string[];
  appNames?: string[];
  uniqueIdentifier?: string;
  tenantId?: string;
}

export const getUserData = (customToken?: string): DecodedUserData | null => {
  if (typeof window === 'undefined') return null;

  const token = customToken || sessionStorage.getItem('token') || localStorage.getItem('token');
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Decode base64 to handle unicode properly
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);

    return {
      email: decoded.sub,
      name: decoded.name,
      role: decoded.roles,
      appNames: decoded.apps,
      uniqueIdentifier: decoded.uniqueIdentifier,
      tenantId: decoded.tenantId,
    };
  } catch (error) {
    console.error('Error decoding token', error);
    return null;
  }
};
