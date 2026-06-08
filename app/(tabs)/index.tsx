import DrawerNavigator from '@/navigation/DrawerNavigator';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/screens/LoginScreen';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1E5AA8" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <DrawerNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
    flex: 1,
    justifyContent: 'center',
  },
});
