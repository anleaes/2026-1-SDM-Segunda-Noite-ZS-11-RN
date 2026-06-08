import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Informe usuario e senha para continuar.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Nao foi possivel autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.panel}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>GC</Text>
        </View>

        <Text style={styles.title}>Gestao de Contratos</Text>
        <Text style={styles.subtitle}>Acesse com seu usuario do sistema</Text>

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#A12727" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>Usuario</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#667085" />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            onChangeText={setUsername}
            onSubmitEditing={handleLogin}
            placeholder="usuario"
            returnKeyType="next"
            style={styles.input}
            value={username}
          />
        </View>

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#667085" />
          <TextInput
            editable={!loading}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
            placeholder="senha"
            returnKeyType="done"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={password}
          />
          <TouchableOpacity onPress={() => setShowPassword((current) => !current)} style={styles.eyeButton}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#667085" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={loading}
          onPress={handleLogin}
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
              <Text style={styles.loginText}>Entrar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    justifyContent: 'center',
    padding: 20,
  },
  panel: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E7ECF3',
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 420,
    padding: 22,
    width: '100%',
  },
  logo: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#1E5AA8',
    borderRadius: 8,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },
  title: {
    color: '#17233D',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#667085',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 5,
    textAlign: 'center',
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    padding: 11,
  },
  errorText: {
    color: '#A12727',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    color: '#34415A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 12,
  },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D8DEE9',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  input: {
    color: '#17233D',
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  eyeButton: {
    padding: 6,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#1E5AA8',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 22,
    minHeight: 50,
  },
  loginButtonDisabled: {
    opacity: 0.75,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
