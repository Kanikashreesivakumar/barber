import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'customer' | 'barber') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      console.log('loadProfile: attempting to load profile for userId:', userId);
      
      // 1) Try lookup by user_id
      let resp = await supabase.from('profiles').select('*').eq('user_id', userId);
      console.log('loadProfile: user_id lookup result:', { error: resp.error, dataLength: resp.data?.length });
      if (!resp.error && resp.data && resp.data.length > 0) {
        console.log('loadProfile: found profile by user_id:', resp.data[0]);
        setProfile(resp.data[0]);
        return;
      }

      // 2) Try lookup by id (as a list query to avoid maybeSingle JSON errors)
      try {
        resp = await supabase.from('profiles').select('*').eq('id', userId);
        console.log('loadProfile: id lookup result:', { error: resp.error, dataLength: resp.data?.length });
        if (!resp.error && resp.data && resp.data.length > 0) {
          console.log('loadProfile: found profile by id:', resp.data[0]);
          setProfile(resp.data[0]);
          return;
        }
      } catch (e) {
        console.warn('profiles.id lookup error (possible type mismatch)', e);
      }

      // 3) Fallback: by email
      try {
        const { data: userData } = await supabase.auth.getUser();
        const email = userData?.user?.email;
        console.log('loadProfile: trying email fallback for:', email);
        if (email) {
          const { data: byEmail, error: emailErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email);
          console.log('loadProfile: email lookup result:', { error: emailErr, dataLength: byEmail?.length });
          if (emailErr) {
            console.error('Error loading profile by email', { code: (emailErr as any).code, message: emailErr.message, details: emailErr.details });
          } else if (byEmail && byEmail.length > 0) {
            if (byEmail.length > 1) {
              console.warn('Multiple profile rows found for email; picking the first one', { email, count: byEmail.length });
            }
            console.log('loadProfile: found profile by email:', byEmail[0]);
            setProfile(byEmail[0]);
            return;
          }
        }
      } catch (innerErr) {
        console.error('Fallback profile lookup failed', innerErr);
      }

      console.warn('No profile found for user', userId, '- creating default customer profile');
      
      // 4) Last resort: create a default profile if none exists
      try {
        const { data: userData } = await supabase.auth.getUser();
        const email = userData?.user?.email;
        if (email) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({ 
              user_id: userId, 
              email: email, 
              full_name: email.split('@')[0], 
              role: 'customer' 
            })
            .select();
          
          if (createError) {
            console.error('Failed to create default profile:', createError);
          } else if (newProfile && newProfile.length > 0) {
            console.log('loadProfile: created default profile:', newProfile[0]);
            setProfile(newProfile[0]);
            return;
          }
        }
      } catch (createErr) {
        console.error('Error creating default profile:', createErr);
      }
      
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullName: string, role: 'customer' | 'barber') {
    console.log('Auth.signUp requested', { email, role });
    const { data, error } = await supabase.auth.signUp({ email, password });
    console.log('Auth.signUp response', { data, error });

    if (error) {
      console.error('Auth.signUp error', error);
      throw error;
    }

    if (data?.user) {
      console.log('Creating profile for user', data.user.id);
      // insert a profile and include user_id to link to auth user (avoid forcing id if table uses bigint)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({ user_id: data.user.id, email, full_name: fullName, role })
        .select();

      console.log('Profile insert result', { profileData, profileError });

      if (profileError) {
        console.error('Profile insert error - this will cause dashboard navigation issues:', profileError);
        // Try fallback: insert without user_id in case the column doesn't exist
        try {
          console.log('Trying profile insert without user_id...');
          const { data: fallbackProfile, error: fallbackError } = await supabase
            .from('profiles')
            .insert({ email, full_name: fullName, role })
            .select();
          
          if (fallbackError) {
            console.error('Fallback profile insert also failed:', fallbackError);
          } else {
            console.log('Fallback profile insert succeeded:', fallbackProfile);
          }
        } catch (fallbackErr) {
          console.error('Fallback profile insert threw error:', fallbackErr);
        }
      }

      if (role === 'barber') {
        console.log('User selected barber role - attempting to create barber record...');
        
        // First, sync barber to MongoDB backend
        try {
          const mongoResponse = await fetch('http://localhost:5000/api/auth/sync-barber', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email,
              name: fullName,
              phone: '',
              shopName: `${fullName}'s Barber Shop`
            })
          });
          
          if (mongoResponse.ok) {
            const mongoData = await mongoResponse.json();
            console.log('✅ Barber synced to MongoDB:', mongoData);
          } else {
            console.error('❌ Failed to sync barber to MongoDB:', await mongoResponse.text());
          }
        } catch (mongoError) {
          console.error('❌ Error syncing barber to MongoDB:', mongoError);
        }
        
        // Then create in Supabase for compatibility
        console.log('Checking barbers table structure...');
        try {
          const { data: existingBarbers, error: selectError } = await supabase
            .from('barbers')
            .select('*')
            .limit(1);
          console.log('Barbers table select test:', { selectError, sampleData: existingBarbers });
        } catch (selectErr) {
          console.error('Cannot access barbers table:', selectErr);
        }
        
        // link barber record to the auth user id as user_id so we can find barber by user
        const { data: barberData, error: barberError } = await supabase
          .from('barbers')
          .insert({ 
            user_id: data.user.id, 
            email: email,
            role: role,
            specialization: 'General', 
            experience_years: 0 
          })
          .select();

        console.log('Barber insert result', { barberData, barberError });

        if (barberError) {
          console.error('Barber insert error - detailed:', {
            code: (barberError as any).code,
            message: barberError.message,
            details: barberError.details,
            hint: (barberError as any).hint
          });
          
          // Try fallback: insert without user_id and role in case columns don't exist
          console.log('Trying barber insert without user_id and role...');
          try {
            const { data: fallbackBarber, error: fallbackBarberError } = await supabase
              .from('barbers')
              .insert({ 
                email: email,
                specialization: 'General', 
                experience_years: 0 
              })
              .select();
              
            if (fallbackBarberError) {
              console.error('Fallback barber insert also failed:', {
                code: (fallbackBarberError as any).code,
                message: fallbackBarberError.message,
                details: fallbackBarberError.details,
                hint: (fallbackBarberError as any).hint
              });
            } else {
              console.log('Fallback barber insert succeeded:', fallbackBarber);
            }
          } catch (fallbackErr) {
            console.error('Fallback barber insert threw error:', fallbackErr);
          }
          
          // Try minimal insert with just required fields
          console.log('Trying minimal barber insert...');
          try {
            const { data: minimalBarber, error: minimalError } = await supabase
              .from('barbers')
              .insert({ 
                specialization: 'General'
              })
              .select();
              
            if (minimalError) {
              console.error('Minimal barber insert failed:', {
                code: (minimalError as any).code,
                message: minimalError.message,
                details: minimalError.details
              });
            } else {
              console.log('Minimal barber insert succeeded:', minimalBarber);
            }
          } catch (minimalErr) {
            console.error('Minimal barber insert threw error:', minimalErr);
          }
          
          // Don't throw here - let profile creation continue
          console.warn('Barber record creation failed, but continuing with profile...');
        } else {
          console.log('Barber record created successfully:', barberData);
        }
      }
    }
  }

  async function signIn(email: string, password: string) {
    console.log('Auth.signIn requested', { email });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    console.log('Auth.signIn response', { data, error });

    if (error) {
      console.error('Auth.signIn error', error);
      throw error;
    }
    // load profile for the signed in user so UI can immediately pick the correct dashboard
    if (data?.user) {
      await loadProfile(data.user.id);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
