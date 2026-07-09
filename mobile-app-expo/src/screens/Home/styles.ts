import { StyleSheet, Dimensions } from 'react-native';
import { Theme } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 380);
const MODAL_HEIGHT = MODAL_WIDTH * 1.5;

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
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
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
    borderWidth: 0.5,
    maxWidth: 280,
  },
  promoIcon: { fontSize: 18 },
  promoText: { color: Theme.colors.textPrimary, fontSize: 12, fontWeight: '600' },

  // Content
  contentPadding: {
    paddingBottom: Theme.spacing.xl * 2,
  },
  sectionContainer: {
    marginTop: 32,
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
    color: Theme.colors.accent,
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
    paddingVertical: 14,
    gap: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)', // subtle border for glass
  },
  quickLinkIcon: {
    width: 44, height: 44, borderRadius: Theme.radius.lg,
    backgroundColor: 'rgba(255,193,7,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  quickLinkText: {
    color: Theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Error & Loading
  loadingText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
  },
  errorText: {
    color: Theme.colors.textSecondary,
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
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: Theme.radius.btn,
  },
  retryButton: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Promo Modal
  promoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)', // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  promoModalContainer: {
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  promoModalCloseBtn: {
    position: 'absolute',
    top: -45,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  promoModalImage: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.radius.lg,
  },
});
