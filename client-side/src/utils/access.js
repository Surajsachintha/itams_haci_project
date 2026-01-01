import api from '../axiosConfig';

export function getRole() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    return payload.role;
  }

export async function getPermission(tag) {
  try {
    const response = await api.post("/permission", { tag });
    return response.data[0];
  } catch (error) {
    console.error(error);
  }
  
}

