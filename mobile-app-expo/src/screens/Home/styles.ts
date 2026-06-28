import { StyleSheet, Platform, StatusBar } from 'react-native';
import { Theme } from '../../theme/tokens';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: Theme.colors.accent,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  avatarButton: {
    padding: 0,
    marginLeft: -4,
  },
  sectionContainer: {
    marginBottom: Theme.spacing.lg * 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  sectionTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: Theme.colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingLeft: Theme.spacing.md,
    paddingRight: Theme.spacing.sm, // Trừ hao item cuối
  },
  errorText: {
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.md,
  },
  retryButton: {
    color: Theme.colors.accent,
    fontWeight: 'bold',
    fontSize: 16,
    padding: Theme.spacing.sm,
  }
});
