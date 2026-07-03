import { StyleSheet } from 'react-native';
import { Theme } from '../../theme/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTextCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  zoomContent: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  screenArea: {
    alignItems: 'center',
    marginBottom: 60,
    width: '100%',
  },
  screenCurve: {
    width: 300,
    height: 20,
    borderTopWidth: 4,
    borderTopColor: Theme.colors.gold,
    borderTopLeftRadius: 150,
    borderTopRightRadius: 150,
    shadowColor: Theme.colors.gold,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  screenText: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 4,
    marginTop: 10,
  },
  seatGrid: {
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowLabel: {
    color: '#888',
    width: 24,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  legendText: {
    color: '#aaa',
    fontSize: 10,
  },
  stickyBottom: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#333',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  summaryLabel: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  seatsText: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceText: {
    color: Theme.colors.gold,
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: Theme.colors.accent,
    paddingVertical: 14,
    borderRadius: Theme.radius.btn,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  errorText: {
    color: Theme.colors.textMuted,
  }
});
