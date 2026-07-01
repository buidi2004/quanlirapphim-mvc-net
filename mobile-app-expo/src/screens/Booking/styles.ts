import { StyleSheet } from 'react-native';
import { Theme } from '../../theme/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  screenArea: {
    alignItems: 'center',
    marginVertical: Theme.spacing.lg,
  },
  screenLine: {
    width: '80%',
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  screenText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginTop: Theme.spacing.sm,
    letterSpacing: 2,
  },
  mapContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 150, // Nhường chỗ cho Sticky Bottom Summary
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rowLabel: {
    color: Theme.colors.textMuted,
    width: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: Theme.spacing.sm,
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
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  summaryLabel: {
    color: Theme.colors.textMuted,
    fontSize: 14,
  },
  seatsText: {
    color: Theme.colors.gold,
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: '80%', // Tránh text dài tràn màn hình
  },
  priceText: {
    color: Theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: Theme.colors.accent,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.btn,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
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
