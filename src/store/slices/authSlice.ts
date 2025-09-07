import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AxiosInstance from '../AxiosInstance';

interface User {
  _id?: string;
  id?: string;
  username: string;
  fullname: string;
  email?: string;
  role?: 'admin' | 'manager' | 'staff';
  accessToken?: string;
}

interface LoginResponse {
  user: User;
  access_token: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper functions for localStorage
const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const getFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const removeFromStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Get initial state from localStorage
const getInitialState = (): AuthState => {
  const savedUser = getFromStorage('user');
  const savedToken = getFromStorage('accessToken');
  
  return {
    user: savedUser,
    accessToken: savedToken,
    isAuthenticated: !!(savedUser && savedToken),
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response: any = await AxiosInstance().post('/auth/login', credentials);
      console.log('Login response:', response);
      
      // Trả về response.data thay vì toàn bộ response
      const responseData = response.data || response;
      
      // Kiểm tra response có đúng format không
      if (responseData && responseData.user && responseData.access_token) {
        return responseData as LoginResponse;
      }
      return rejectWithValue('Invalid response format');
    } catch (error: any) {
      console.error('Login error details:', error);
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      // Add accessToken to user object for easier access
      const userWithToken = {
        ...action.payload.user,
        accessToken: action.payload.access_token
      };
      state.user = userWithToken;
      state.accessToken = action.payload.access_token;
      state.error = null;
      
      // Save to localStorage
      saveToStorage('user', userWithToken);
      saveToStorage('accessToken', action.payload.access_token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Remove from localStorage
      removeFromStorage('user');
      removeFromStorage('accessToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        // Add accessToken to user object for easier access
        const userWithToken = {
          ...action.payload.user,
          accessToken: action.payload.access_token
        };
        state.user = userWithToken;
        state.accessToken = action.payload.access_token;
        state.error = null;
        
        // Save to localStorage
        saveToStorage('user', userWithToken);
        saveToStorage('accessToken', action.payload.access_token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
