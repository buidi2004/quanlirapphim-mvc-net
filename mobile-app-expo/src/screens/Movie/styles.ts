import { StyleSheet } from 'react-native';
import { Theme } from '../../theme/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 100, // Safe padding for sticky bottom
  },
  posterHeader: {
    width: '100%',
    height: 300,
    justifyContent: 'flex-end',
  },
  posterOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 17, 17, 0.6)',
  },
  infoContainer: {
    padding: Theme.spacing.lg,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.sm,
  },
  metaText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    marginBottom: Theme.spacing.sm,
  },
  description: {
    color: Theme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Theme.spacing.md,
  },
  sectionTitle: {
    color: Theme.colors.gold,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  showtimeCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.card,
    marginRight: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#333',
  },
  timeText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cinemaText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
  },
  priceText: {
    color: Theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: Theme.colors.accent,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.btn,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Theme.colors.textMuted,
  }
});
