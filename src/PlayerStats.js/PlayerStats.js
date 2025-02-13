import React, { useState, useEffect } from 'react';
import { firestore} from '../firebase/Firebase';
import { collection, getDocs } from 'firebase/firestore';
import './PlayerStats.css';

const PlayerStats = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const matchesSnapshot = await getDocs(collection(firestore, 'matches'));
      const playerStats = {};

      // Process all matches to collect player statistics
      matchesSnapshot.forEach((doc) => {
        const match = doc.data();
        
        // Process winner
        if (!playerStats[match.winner]) {
          playerStats[match.winner] = {
            name: match.winner,
            wins: 0,
            losses: 0,
            totalScore: 0,
            matches: 0
          };
        }
        playerStats[match.winner].wins += 1;
        playerStats[match.winner].totalScore += match.winnerScore;
        playerStats[match.winner].matches += 1;

        // Process loser
        if (!playerStats[match.loser]) {
          playerStats[match.loser] = {
            name: match.loser,
            wins: 0,
            losses: 0,
            totalScore: 0,
            matches: 0
          };
        }
        playerStats[match.loser].losses += 1;
        playerStats[match.loser].totalScore += match.loserScore;
        playerStats[match.loser].matches += 1;
      });

      // Convert to array and calculate additional stats
      const playersArray = Object.values(playerStats).map(player => ({
        ...player,
        winRate: ((player.wins / player.matches) * 100).toFixed(1),
        avgScore: Math.round(player.totalScore / player.matches)
      }));

      // Sort by wins and then win rate
      const sortedPlayers = playersArray.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return parseFloat(b.winRate) - parseFloat(a.winRate);
      });

      setPlayers(sortedPlayers);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Table Tennis Leaderboard</h2>
      
      <div className="leaderboard-table">
        <div className="table-header">
          <div className="rank">Rank</div>
          <div className="name">Player</div>
          <div className="stat">Matches</div>
          <div className="stat">Wins</div>
          <div className="stat">Losses</div>
          <div className="stat">Win Rate</div>
          <div className="stat">Avg Score</div>
        </div>

        {players.map((player, index) => (
          <div key={player.name} className="table-row">
            <div className="rank">
              {index + 1}
              {index < 3 && <span className={`trophy rank-${index + 1}`}>🏆</span>}
            </div>
            <div className="name">{player.name}</div>
            <div className="stat">{player.matches}</div>
            <div className="stat">{player.wins}</div>
            <div className="stat">{player.losses}</div>
            <div className="stat">{player.winRate}%</div>
            <div className="stat">{player.avgScore}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStats;