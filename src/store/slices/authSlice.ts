import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AxiosInstance from '../AxiosInstance';

interface User {
  _id?: string;
  id?: string;
  username: string;
  fullname: string;
  email?: string;
  phoneNumber?: string;
  bankNumber?: string;
  bankName?: string;
  role?: 'admin' | 'manager' | 'staff';
  accessToken?: string;
}

interface LoginResponse {
  user: User;
  access_token: string;
}

interface UpdateProfileDto {
  fullname: string;
  phoneNumber?: string;
  bankNumber?: string;
  bankName?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
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
    isProfileLoading: false,
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

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.accessToken;
      
      if (!token) {
        return rejectWithValue('No access token available');
      }

      const response: any = await AxiosInstance().get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const responseData = response.data || response;
      return responseData as User;
    } catch (error: any) {
      console.error('Get profile error details:', error);
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (updateData: UpdateProfileDto, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.accessToken;
      
      if (!token) {
        return rejectWithValue('No access token available');
      }

      const response: any = await AxiosInstance().put('/auth/profile', updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const responseData = response.data || response;
      return responseData as User;
    } catch (error: any) {
      console.error('Update profile error details:', error);
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile');
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
    updateUserProfileSuccess: (state, action: PayloadAction<User>) => {
      state.user = { ...state.user, ...action.payload };
      state.isProfileLoading = false;
      state.error = null;
      
      // Update localStorage
      if (state.user) {
        saveToStorage('user', state.user);
      }
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
      })
      .addCase(getUserProfile.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.user = { ...state.user, ...action.payload };
        state.error = null;
        
        // Update localStorage
        if (state.user) {
          saveToStorage('user', state.user);
        }
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.user = { ...state.user, ...action.payload };
        state.error = null;
        
        // Update localStorage
        if (state.user) {
          saveToStorage('user', state.user);
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError, updateUserProfileSuccess } = authSlice.actions;
export default authSlice.reducer;
