"use client";
import AuthForm from "@/components/AuthForm";
import TaskManager from "@/components/TaskManager";
import { supabase } from "@/supabase-client";
import { useEffect, useState } from "react";


// username:lonij10224@fixwap.com
// password:123456

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const fetchSession = async () => {
    const { data } = await supabase.auth.getSession();
    console.log("data11", data);
    setSession(data.session);
  };
  useEffect(() => {
    fetchSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  return <>{!session ? <AuthForm /> : <TaskManager session={session} />}</>;
}
