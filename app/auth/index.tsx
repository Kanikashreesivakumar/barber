import { User, Scissors, Phone, Mail, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../src/contexts/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const auth = useAuth();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [role, setRole] = useState<'customer' | 'barber'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      if (mode === 'signup') {
        await auth.signUp(email, password, fullName, role);
        Alert.alert('Success', 'Account created. Check your email for confirmation if required.');
        // navigation or redirect after signup
        // router.push('/'); // adjust to your home route
      } else {
        await auth.signIn(email, password);
        Alert.alert('Success', 'Signed in');
        // router.push('/');
      }
    } catch (err: any) {
      console.error('Auth error', err);
      Alert.alert('Authentication error', err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View animation="fadeIn" duration={400}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Scissors size={32} />
            </View>
            <Text style={styles.title}>Barber Slot</Text>
            <Text style={styles.subtitle}>{mode === 'signup' ? 'Create an account' : 'Sign in to continue'}</Text>
          </View>

          <View style={styles.loginContainer}>
            <View style={styles.loginHeader}>
              <Text style={styles.loginTitle}>{mode === 'signup' ? 'Sign up' : 'Login'}</Text>
            </View>

            {mode === 'signup' && (
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <TextInput placeholder="Full name" value={fullName} onChangeText={setFullName} style={styles.input} />
                </View>
              </View>
            )}

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
              </View>

              <View style={styles.inputContainer}>
                <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
              </View>

              {mode === 'signup' && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <TouchableOpacity onPress={() => setRole('customer')} style={[styles.methodButton, role === 'customer' ? styles.activeMethodButton : undefined]}>
                    <Text style={[styles.methodButtonText, role === 'customer' ? styles.activeMethodButtonText : undefined]}>Customer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setRole('barber')} style={[styles.methodButton, role === 'barber' ? styles.activeMethodButton : undefined]}>
                    <Text style={[styles.methodButtonText, role === 'barber' ? styles.activeMethodButtonText : undefined]}>Barber</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>{mode === 'signup' ? 'Create account' : 'Sign in'}</Text>
                )}
              </TouchableOpacity>

              <View style={{ marginTop: 12, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
                  <Text style={{ color: '#673AB7' }}>{mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(103, 58, 183, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#673AB7',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#757575',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#673AB7',
    marginTop: 10,
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  backText: {
    fontSize: 16,
    color: '#673AB7',
  },
  loginContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(103, 58, 183, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#673AB7',
  },
  loginMethodToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  methodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeMethodButton: {
    backgroundColor: '#673AB7',
  },
  methodButtonText: {
    fontSize: 16,
    color: '#673AB7',
  },
  activeMethodButtonText: {
    color: '#FFFFFF',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#673AB7',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
