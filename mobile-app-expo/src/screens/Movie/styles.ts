import { StyleSheet, Dimensions } from 'react-native';
import { Theme } from '../../theme/tokens';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    zIndex: 100,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 120, // Safe padding for sticky bottom
  },
  posterHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
  },
  posterImage: {
    ...StyleSheet.absoluteFill,
  },
  posterOverlay: {
    ...StyleSheet.absoluteFill,
  },
  heroInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Theme.spacing.lg,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: Theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Theme.spacing.sm,
  },
  badgeAge: {
    backgroundColor: '#e50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeAgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaText: {
    color: '#ccc',
    fontSize: 14,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  trailerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    marginTop: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  trailerBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: Theme.spacing.lg,
    backgroundColor: '#111',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: Theme.spacing.lg,
  },
  dateSlider: {
    marginBottom: Theme.spacing.lg,
    gap: 12,
  },
  dateChip: {
    backgroundColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  dateChipActive: {
    backgroundColor: Theme.colors.gold,
    borderColor: Theme.colors.gold,
  },
  dayName: {
    color: '#888',
    fontSize: 12,
  },
  dayNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  monthLabel: {
    color: '#888',
    fontSize: 10,
  },
  dateTextActive: {
    color: '#000',
  },
  cinemaGroup: {
    backgroundColor: '#222',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.md,
  },
  cinemaName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cinemaLocation: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
  },
  showtimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  showtimeCard: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  showtimeCardActive: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: Theme.colors.gold,
  },
  timeText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeTextActive: {
    color: Theme.colors.gold,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 17, 17, 0.95)',
    paddingTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    color: Theme.colors.gold,
    fontSize: 22,
    fontWeight: 'bold',
  },
  cinemaText: {
    color: '#888',
    fontSize: 12,
  },
  bookButton: {
    backgroundColor: Theme.colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Theme.radius.btn,
  },
  bookButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: Theme.colors.textMuted,
  }
});
