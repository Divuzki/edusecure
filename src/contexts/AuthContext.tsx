import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "react-hot-toast";

type Role = "student" | "teacher" | "admin" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: Role;
  loading: boolean;
  accessToken: string | null;
  signUp: (
    email: string,
    password: string,
    role: Role
  ) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<Role>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setAccessToken(currentSession?.access_token || null);

      if (currentSession?.user) {
        try {
          // Fetch user role from profiles table
          console.log("Fetching role for user ID:", currentSession.user.id);
          
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 10000)
          );
          
          const queryPromise = supabase
            .from("profiles")
            .select("role")
            .eq("id", currentSession.user.id)
            .single();
          
          const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as { data: { role: string } | null; error: unknown | null; };
          
          console.log("Query completed. Data:", data, "Error:", error);

          if (error) {
            console.error("Error fetching user role:", error);
            console.error("Error details:", error.message, error.code);
            // Set a default role if profile doesn't exist
            if (error.code === 'PGRST116') {
              console.log("Profile not found, creating default profile");
              const { error: insertError } = await supabase
                .from("profiles")
                .insert({
                  id: currentSession.user.id,
                  email: currentSession.user.email,
                  role: "student",
                  created_at: new Date().toISOString(),
                });
              
              if (insertError) {
                console.error("Error creating profile:", insertError);
              } else {
                console.log("Profile created successfully, setting role to student");
                setUserRole("student");
              }
            } else {
              // For other errors, set a default role
              console.log("Setting default role due to error");
              setUserRole("student");
            }
          } else if (data) {
            console.log("User role fetched:", data.role);
            setUserRole(data.role as Role);
          } else {
            console.log("No data returned from profiles query, setting default role");
            setUserRole("student");
          }
        } catch (catchError) {
          console.error("Caught error in role fetching:", catchError);
          console.log("Setting default role due to catch error");
          setUserRole("student");
        }
      } else {
        setUserRole(null);
        setAccessToken(null);
      }

      setLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setAccessToken(initialSession?.access_token || null);

      if (initialSession?.user) {
        console.log("Initial session - Fetching role for user ID:", initialSession.user.id);
        
        const fetchInitialRole = async () => {
          try {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Initial query timeout')), 10000)
            );
            
            const queryPromise = supabase
              .from("profiles")
              .select("role")
              .eq("id", initialSession.user.id)
              .single();
            
            const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as { data: { role: string } | null; error: unknown | null; };
            
            console.log("Initial session - Query completed. Data:", data, "Error:", error);
            
            if (error) {
              console.error("Initial session - Error fetching user role:", error);
              console.error("Initial session - Error details:", error.message, error.code);
              // Set a default role if profile doesn't exist
              if (error.code === 'PGRST116') {
                console.log("Initial session - Profile not found, creating default profile");
                const { error: insertError } = await supabase
                  .from("profiles")
                  .insert({
                    id: initialSession.user.id,
                    email: initialSession.user.email,
                    role: "student",
                    created_at: new Date().toISOString(),
                  });
                
                if (insertError) {
                  console.error("Initial session - Error creating profile:", insertError);
                } else {
                  console.log("Initial session - Profile created successfully, setting role to student");
                  setUserRole("student");
                }
              } else {
                // For other errors, set a default role
                console.log("Initial session - Setting default role due to error");
                setUserRole("student");
              }
            } else if (data) {
              console.log("Initial session - User role fetched:", data.role);
              setUserRole(data.role as Role);
            } else {
              console.log("Initial session - No data returned from profiles query, setting default role");
              setUserRole("student");
            }
          } catch (catchError) {
            console.error("Initial session - Caught error in role fetching:", catchError);
            console.log("Initial session - Setting default role due to catch error");
            setUserRole("student");
          } finally {
            setLoading(false);
          }
        };
        
        fetchInitialRole();
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, role: Role) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create a profile with the role
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: email,
          role: role,
          created_at: new Date().toISOString(),
        });
      }

      // Store the access token
      const token = data.session?.access_token || null;
      setAccessToken(token);

      toast.success(
        "Registration successful! Please check your email for verification."
      );
      return token;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during sign up";
      toast.error(errorMessage);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Store the access token
      const token = data.session?.access_token || null;
      setAccessToken(token);

      toast.success("Welcome back!");
      return token;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during sign in";
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear the access token
      setAccessToken(null);

      toast.success("Signed out successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during sign out";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Helper function to get authentication headers for API requests
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add the API key
    const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (apiKey) {
      headers["apikey"] = apiKey;
    }

    // Add the authorization token if available
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return headers;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        loading,
        accessToken,
        signUp,
        signIn,
        signOut,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
