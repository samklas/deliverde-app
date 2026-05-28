import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'expo-router';
import leaderboardStore from '@/stores/leaderboardStore';
import {
  getLeaderboardUsers,
  getPreviousMonthWinner,
  PreviousMonthWinner,
} from '@/services/users.service';
import { theme } from '@/theme';


const MONTHS = [
  'tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu',
  'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu',
];

const formatMonthKey = (key: string): string => {
  const [year, m] = key.split('-');
  const name = MONTHS[parseInt(m, 10) - 1] ?? '';
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
};

const LeaderboardRow = ({
  name,
  points,
  rank,
  delay,
  onPress,
}: {
  name: string;
  points: number;
  rank: number;
  delay: number;
  onPress: () => void;
}) => {
  const isFirst = rank === 1;

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(15)}>
      <Pressable onPress={onPress}>
        <View style={s.row}>
          <LinearGradient colors={["#37891C", "#37891C"]} style={s.rankBadge}>
            <Text style={s.rankNum}>{rank}</Text>
          </LinearGradient>

          <Text style={[s.rowName, isFirst && s.rowNameFirst]} numberOfLines={1}>
            {name}
          </Text>

          <View style={s.scoreBlock}>
            <Text style={[s.scoreNum, isFirst && s.scoreNumFirst]}>{points}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const PreviousWinnerCard = ({ winner }: { winner: PreviousMonthWinner }) => {
  return (
    <Animated.View entering={FadeInDown.delay(480).springify().damping(15)}>
      <LinearGradient
        colors={['#E9F7DA', '#80cf42']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={s.winnerCard}
      >
        {/* Left */}
        <View style={s.winnerLeft}>
          <Text style={s.winnerLabel}>VIIME KUUN VOITTAJA</Text>
          <Text style={s.winnerName}>{winner.username}</Text>
          <Text style={s.winnerSub}>
            {winner.points} pistettä · {formatMonthKey(winner.monthKey)}
          </Text>
        </View>

        {/* Right */}
        <View style={s.winnerRight}>
          <View style={s.trophyCircle}>
            <Text style={{ fontSize: 17 }}>🌱</Text>
          </View>
          <Text style={s.sparkA}>✦</Text>
          <Text style={s.sparkB}>✦</Text>
        </View>

      </LinearGradient>
    </Animated.View>
  );
};


const LeaderboardBox = observer(() => {
  const { users } = leaderboardStore;
  const sortedUsers = users.filter((u) => u.uid).slice(0, 3);
  const router = useRouter();
  const [previousWinner, setPreviousWinner] = useState<PreviousMonthWinner | null>(null);

  useEffect(() => {
    Promise.all([getLeaderboardUsers(), getPreviousMonthWinner()])
      .then(([fetched, winner]) => {
        leaderboardStore.setUsers(fetched);
        setPreviousWinner(winner);
      })
      .catch(() => {});
  }, []);

  return (
    <Pressable onPress={() => router.push('/leaderboard-view')}>
      <View style={s.card}>
        {/* Header */}
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>Kuukauden salaattisankarit</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </View>

        <Text style={s.sectionLabel}>TOP 3 TÄLLÄ HETKELLÄ</Text>

        {/* Top 3 rows */}
        <View style={s.rowList}>
          {sortedUsers.map((user, i) => (
            <LeaderboardRow
              key={user.uid || i}
              name={user.username}
              points={user.points}
              rank={i + 1}
              delay={i * 60}
              onPress={() => router.push('/leaderboard-view')}
            />
          ))}
        </View>

        {/* Previous month winner */}
        {previousWinner && (
          <View style={s.winnerSection}>
            <View style={s.dividerRow}>
              <View style={s.divLine} />
              <Text style={s.divLabel}></Text>
              <View style={s.divLine} />
            </View>
            <PreviousWinnerCard winner={previousWinner} />
          </View>
        )}
      </View>
    </Pressable>
  );
});

export default LeaderboardBox;


const s = StyleSheet.create({
  // Matches the shadow/radius style of other app cards
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  // Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  cardTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    flex: 1,
    marginRight: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: theme.fontFamily.medium,
    color: '#A0A8A0',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.small,
  },

  // Rows
  rowList: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 9,
    paddingHorizontal: 10,
    gap: 9,
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNum: {
    fontSize: 13,
    fontFamily: theme.fontFamily.bold,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rowName: {
    flex: 1,
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
  rowNameFirst: {
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreNum: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  scoreNumFirst: {
    color: theme.colors.primary,
  },
  // Winner section
  winnerSection: {
    marginTop: theme.spacing.medium,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.small,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8EDE6',
  },
  divLabel: {
    fontSize: 10,
    fontFamily: theme.fontFamily.bold,
    color: '#C0CAC0',
    letterSpacing: 1.5,
  },
  winnerCard: {
    borderRadius: theme.borderRadius.large,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  winnerLeft: {
    flex: 1,
  },
  winnerRight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 14,
    gap: 5,
  },
  trophyCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D7A1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  sparkA: {
    fontSize: 11,
    color: '#37891C',
    marginTop: 3,
    opacity: 0.9,
  },
  sparkB: {
    fontSize: 7,
    color: '#2D7A1F',
    opacity: 0.6,
    marginTop: 8,
  },
  winnerLabel: {
    fontSize: 10,
    fontFamily: theme.fontFamily.bold,
    color: '#2D7A1F',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  winnerName: {
    fontSize: 22,
    fontFamily: theme.fontFamily.bold,
    color: '#184B10',
    marginBottom: 3,
    lineHeight: 26,
  },
  winnerSub: {
    fontSize: 12,
    fontFamily: theme.fontFamily.regular,
    color: '#2D7A1F',
  },
});
