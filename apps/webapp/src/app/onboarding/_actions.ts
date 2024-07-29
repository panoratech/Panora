"use server";

import useCreateUser from "@/hooks/create/useCreateUser";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Webhook, Badge } from "lucide-react";
import { toast } from "sonner";

export const completeOnboarding = async (formData: FormData, add: Function) => {
  const { userId } = auth();

  if (!userId) {
    return { message: "No Logged In User" };
  }

  try {
    const res = await clerkClient().users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        projectName: formData.get("projectName"),
      },
    });
    // create the clerk user + project inside our db
    await add({
      project_name:  formData.get("projectName") as string,
      clerk_user_id: userId
    });
    return { message: res.publicMetadata };
  } catch (err) {
    return { error: "There was an error updating the user metadata." };
  }
};