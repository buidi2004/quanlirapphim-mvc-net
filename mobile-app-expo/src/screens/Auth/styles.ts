import { StyleSheet, Dimensions } from 'react-native';
import { Theme } from '../../theme/tokens';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  bgImage: {
    ...StyleSheet.absoluteFill,
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  container: {
    flex: 1,
    padding: Theme.spacing.lg,
    justifyContent: 'center',
    paddingTop: height * 0.15,
  },
  logo: {
    color: Theme.colors.gold,
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(255, 193, 7, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: Theme.spacing.lg * 2,
    letterSpacing: 1,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainer: {
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: Theme.radius.btn,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: Theme.colors.gold,
    paddingVertical: 14,
    borderRadius: Theme.radius.btn,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    shadowColor: Theme.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  linkText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
    fontSize: 14,
  },
  linkAccent: {
    color: Theme.colors.gold,
    fontWeight: 'bold',
  },
  forgotText: {
    color: Theme.colors.textPrimary,
    textAlign: 'right',
    fontSize: 12,
    marginTop: -4,
    marginBottom: 16,
  },
  errorText: {
    color: Theme.colors.accent,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    padding: 8,
    borderRadius: 4,
  }
});
