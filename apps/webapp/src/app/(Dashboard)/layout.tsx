'use client'
import "../globals.css";
import { RootLayout } from "@/components/RootLayout";
import useProfileStore from "@/state/profileStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import useUser from "@/hooks/get/useUser";
import Intercom from '@intercom/messenger-js-sdk';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userInitialized, setUserInitialized] = useState(false)
  const router = useRouter()
  const { mutate } = useUser()
  const { profile } = useProfileStore()

  // Handle authentication
  useEffect(() => {
    if(!Cookies.get('access_token')) {
      router.replace("/b2c/login")
    } else {
      mutate(
        Cookies.get('access_token'),
        {
          onError: () => router.replace("/b2c/login"),
          onSuccess: () => setUserInitialized(true)
        }
      )
    }
  }, [])

  // Initialize Intercom separately when profile is available
  useEffect(() => {
    if (profile && userInitialized) {
      Intercom({
        app_id: 'kjwzw97u',
        user_id: profile.id_user,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
      });
    }
  }, [profile, userInitialized])

  return (
    userInitialized ? (
      <RootLayout>
        {children}
      </RootLayout> 
    ) : null
  );
}
