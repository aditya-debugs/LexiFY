import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { signup } from "../lib/api";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async ({ email, password, fullName, username }) => {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Create user in backend database
      const response = await signup({
        email,
        fullName,
        username,
        firebaseUid: firebaseUser.uid,
      });

      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return { isPending, error, signupMutation: mutate };
};

export default useSignUp;
