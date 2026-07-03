import { StyleSheet } from 'react-native';
import { Theme } from '../../theme/tokens';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  logo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8, right: 8,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: Theme.colors.accent,
    borderWidth: 1, borderColor: Theme.colors.background,
  },
  avatarButton: {
    padding: 4,
  },

  // Promotion strip
  promoStrip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    gap: 10,
  },
  promoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    maxWidth: 280,
  },
  promoIcon: { fontSize: 18 },
  promoText: { color: '#ddd', fontSize: 12, fontWeight: '600', flex: 1 },

  // Content
  contentPadding: {
    paddingBottom: Theme.spacing.xl * 2,
  },
  sectionContainer: {
    marginBottom: Theme.spacing.lg * 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  sectionTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  seeAllText: {
    color: Theme.colors.warning,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingLeft: Theme.spacing.md,
    paddingRight: Theme.spacing.sm,
  },

  // Quick Links
  quickLinks: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.md,
    gap: 10,
    marginTop: 4,
    marginBottom: Theme.spacing.xl,
  },
  quickLink: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  quickLinkIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,193,7,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  quickLinkText: {
    color: '#ccc',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Error & Loading
  loadingText: {
    color: '#666',
    fontSize: 13,
  },
  errorText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.warning,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Theme.radius.pill,
  },
  retryButton: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
