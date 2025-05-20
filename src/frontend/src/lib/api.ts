//  Only used in dev mode
const API_BASE = import.meta.env.PROD ? "" : "http://localhost:5001";

//  Shared User type
export interface User {
  id: string;
  username: string;
  bio: string;
  profile_picture: string;
  privacy: string;
  notifications: boolean;
  is_anonymous?: boolean;
}

//  Login
export const login = (email: string, password: string) =>
  fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

//  Get user(s)
export const getUser = async (): Promise<{ users: User[] }> => {
  const res = await fetch(`${API_BASE}/api/users/users`);
  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.statusText}`);
  }
  return await res.json();
};

export const updateUser = async (
  id: string,
  data: {
    first_name?: string;
    last_name?: string;
    bio?: string;
    privacy?: string;
    is_anonymous?: boolean;
    profile_picture?: string;
    notifications?: boolean;
    username: string;
  }
) => {
  const res = await fetch(`${API_BASE}/api/users/edit/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res;
};

