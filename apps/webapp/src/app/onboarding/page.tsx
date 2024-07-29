"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./_actions";
import useCreateUser from "@/hooks/create/useCreateUser";

export default function OnboardingComponent() {
  const [error, setError] = React.useState("");
  const { user } = useUser();
  const router = useRouter();
  const { add } = useCreateUser();

  const handleSubmit = async (formData: FormData) => {
    const res = await completeOnboarding(formData, add);
    if (res?.message) {
      // Reloads the user's data from Clerk's API
      await user?.reload();
      router.push("/");
    }
    if (res?.error) {
      setError(res?.error);
    }
  };
  return (
    <div>
      <h1>Welcome to Panora ! Before getting started you must create a project !</h1>
      <form action={handleSubmit}>
        <div>
          <label>Project Name</label>
          <p>Enter the name of your project.</p>
          <input type="text" name="applicationName" required />
        </div>
        {error && <p className="text-red-600">Error: {error}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}