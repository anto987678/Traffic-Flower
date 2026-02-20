import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);
const USER_STORAGE_KEY = 'trafficFlowUser';
const TOKEN_STORAGE_KEY = 'trafficFlowToken';

const readStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

const writeStoredUser = (nextUser) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!nextUser) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
};

const readStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token || null;
};

const writeStoredToken = (nextToken) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!nextToken) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
};

const applyAuthToken = (nextToken) => {
  if (nextToken) {
    api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(() => readStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applyAuthToken(token);
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/signup/me');
        setUser(res.data);
        writeStoredUser(res.data);
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          setUser(null);
          writeStoredUser(null);
          setToken(null);
          writeStoredToken(null);
          applyAuthToken(null);
        } else if (!readStoredUser()) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const resolveUser = (primary, secondary) => {
    if (primary && typeof primary === 'object') {
      return primary.user ?? primary;
    }
    if (secondary && typeof secondary === 'object') {
      return secondary.user ?? secondary;
    }
    return null;
  };

  const resolveToken = (primary, secondary) => {
    if (typeof primary === 'string' && primary.trim()) {
      return primary;
    }
    if (primary && typeof primary === 'object' && typeof primary.token === 'string') {
      return primary.token;
    }
    if (typeof secondary === 'string' && secondary.trim()) {
      return secondary;
    }
    if (secondary && typeof secondary === 'object' && typeof secondary.token === 'string') {
      return secondary.token;
    }
    return null;
  };

  const login = (primary, secondary) => {
    const resolvedUser = resolveUser(primary, secondary);
    const resolvedToken = resolveToken(primary, secondary);
    setUser(resolvedUser);
    writeStoredUser(resolvedUser);
    setToken(resolvedToken);
    writeStoredToken(resolvedToken);
  };

  const logout = async () => {
    try {
      await api.post('/api/signup/logout');
    } catch {
      // Ignore logout errors so callers can still redirect.
    } finally {
      setUser(null);
      writeStoredUser(null);
      setToken(null);
      writeStoredToken(null);
    }
  };

  const deleteAccount = async () => {
    const response = await api.delete('/api/signup/account');
    setUser(null);
    writeStoredUser(null);
    setToken(null);
    writeStoredToken(null);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, deleteAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
