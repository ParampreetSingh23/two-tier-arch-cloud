import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(() => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
 });
 const [token, setToken] = useState(() => localStorage.getItem('token'));
 const [loading, setLoading] = useState(false);

 const login = async (email, password) => {
  setLoading(true);
  try {
   const res = await api.post('/auth/login', { email, password });
   localStorage.setItem('token', res.data.token);
   localStorage.setItem('user', JSON.stringify(res.data.user));
   setToken(res.data.token);
   setUser(res.data.user);
   return { success: true };
  } catch (err) {
   return { success: false, error: err.response?.data?.error || 'Login failed' };
  } finally {
   setLoading(false);
  }
 };

 const register = async (name, email, password, instituteType) => {
  setLoading(true);
  try {
   const res = await api.post('/auth/register', { name, email, password, instituteType });
   localStorage.setItem('token', res.data.token);
   localStorage.setItem('user', JSON.stringify(res.data.user));
   setToken(res.data.token);
   setUser(res.data.user);
   return { success: true };
  } catch (err) {
   return { success: false, error: err.response?.data?.error || 'Registration failed' };
  } finally {
   setLoading(false);
  }
 };

 const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setToken(null);
  setUser(null);
 };

 return (
  <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
   {children}
  </AuthContext.Provider>
 );
};

export const useAuth = () => useContext(AuthContext);
