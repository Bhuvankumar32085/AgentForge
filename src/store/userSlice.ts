import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserState {
  loggedUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const getStoredUser = (): User | null => {
  try {
    const saved = localStorage.getItem("agentforge_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const cachedUser = getStoredUser();

const initialState: UserState = {
  loggedUser: cachedUser,
  isAuthenticated: !!cachedUser,
  loading: !cachedUser, // If cached, loading is false immediately (instant 0ms render!)
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<User | null>) => {
      state.loggedUser = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      if (action.payload) {
        localStorage.setItem("agentforge_user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("agentforge_user");
      }
    },
    clearAuthUser: (state) => {
      state.loggedUser = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem("agentforge_user");
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAuthUser, clearAuthUser, setLoading } = userSlice.actions;
export default userSlice.reducer;
