import { StyleSheet } from 'react-native';
import { Theme } from '../../theme/tokens';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Theme.spacing.lg,
    justifyContent: 'center',
  },
  logo: {
    color: Theme.colors.accent,
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: Theme.spacing.lg * 2,
  },
  inputContainer: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Theme.colors.surface,
    color: Theme.colors.textPrimary,
    borderRadius: Theme.radius.btn,
    padding: Theme.spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: Theme.colors.accent,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.btn,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
    fontSize: 14,
  },
  linkAccent: {
    color: Theme.colors.accent,
    fontWeight: 'bold',
  },
  errorText: {
    color: Theme.colors.accent,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  }
});
