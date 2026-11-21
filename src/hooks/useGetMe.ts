import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { setAuthUser, clearAuthUser, setLoading } from "../store/userSlice";
import { userApi } from "../axios/userApi";

export const useGetMe = () => {
  const dispatch = useAppDispatch();
  const { loggedUser, isAuthenticated, loading } = useAppSelector(
    (state) => state.user
  );

  const fetchMe = useCallback(async () => {
    // Only show blocking loader if user is not already cached
    if (!isAuthenticated) {
      dispatch(setLoading(true));
    }

    try {
      const res = await userApi.get("/me");
      if (res.data?.success && res.data?.data) {
        dispatch(setAuthUser(res.data.data));
      } else {
        dispatch(clearAuthUser());
      }
    } catch {
      dispatch(clearAuthUser());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return { loggedUser, isAuthenticated, loading, refetch: fetchMe };
};
