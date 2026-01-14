import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async ({ email, password }) => {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Sync with backend
      const response = await login({ firebaseUid: firebaseUser.uid });
      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
