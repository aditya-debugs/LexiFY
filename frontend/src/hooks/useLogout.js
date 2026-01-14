import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../lib/api";

const useLogout = () => {
  const queryClient = useQueryClient();
  const { signOut } = useAuth();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: async () => {
      // Sign out from Firebase
      await signOut();
      // Call backend logout (for any cleanup)
      await logout();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;
