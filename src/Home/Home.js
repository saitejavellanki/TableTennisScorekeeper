import React, { useState, useEffect } from 'react';
import { Trophy, Minus } from 'lucide-react';
import { firestore } from '../firebase/Firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import './Home.css';
import PlayerStats from '../PlayerStats.js/PlayerStats';

const Home = () => {
  const [players, setPlayers] = useState({
    player1: { name: '', score: 0 },
    player2: { name: '', score: 0 }
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [previousPlayers, setPreviousPlayers] = useState(new Set());

  // Load recent matches and extract unique player names
  useEffect(() => {
    const matchesQuery = query(
      collection(firestore, 'matches'),
      orderBy('timestamp', 'desc'),
      limit(20) // Increased limit to get more player names
    );

    const unsubscribe = onSnapshot(matchesQuery, (snapshot) => {
      const matches = [];
      const players = new Set();
      
      snapshot.forEach((doc) => {
        const match = doc.data();
        matches.push({ id: doc.id, ...match });
        players.add(match.winner);
        players.add(match.loser);
      });
      
      setRecentMatches(matches);
      setPreviousPlayers(players);
    });

    return () => unsubscribe();
  }, []);

  // Rest of your existing useEffect and functions remain the same
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!gameStarted || winner) return;

      if (event.code === 'Space') {
        event.preventDefault();
        updateScore('player1', 1);
      } else if (event.code === 'Enter') {
        event.preventDefault();
        updateScore('player2', 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, winner, players]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (players.player1.name && players.player2.name) {
      setGameStarted(true);
    }
  };

  const updateScore = (player, increment) => {
    if (winner) return;

    const updatedPlayers = { ...players };
    const newScore = updatedPlayers[player].score + increment;
    const otherPlayer = player === 'player1' ? 'player2' : 'player1';
    const otherScore = updatedPlayers[otherPlayer].score;
    
    if (newScore < 0) return;
    
    updatedPlayers[player].score = newScore;

    // Check for winner with deuce rules
    const hasWon = (score, otherScore) => {
      if (score >= 21) {
        // If both scores are 20 or above, need to win by 2
        if (score >= 20 && otherScore >= 20) {
          return score >= otherScore + 2;
        }
        // Otherwise, first to 21 wins
        return score >= 21;
      }
      return false;
    };

    if (hasWon(newScore, otherScore)) {
      setWinner(player);
      const matchData = {
        winner: updatedPlayers[player].name,
        loser: updatedPlayers[otherPlayer].name,
        winnerScore: newScore,
        loserScore: otherScore,
        timestamp: new Date().toISOString()
      };
      
      addDoc(collection(firestore, 'matches'), matchData)
        .catch(error => console.error('Error adding match:', error));
    }

    setPlayers(updatedPlayers);
  };

  const resetGame = () => {
    setPlayers({
      player1: { name: '', score: 0 },
      player2: { name: '', score: 0 }
    });
    setGameStarted(false);
    setWinner(null);
  };

  if (!gameStarted) {
    return (
      <div className="setup-container">
        <div className="setup-card">
          <h1 className="setup-title">Table Tennis Scorer</h1>
          <form onSubmit={handleNameSubmit} className="player-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Player 1 Name (Space to score)"
                value={players.player1.name}
                onChange={(e) => setPlayers(prev => ({
                  ...prev,
                  player1: { ...prev.player1, name: e.target.value }
                }))}
                className="input-field"
                list="player-names"
                required
              />
              <datalist id="player-names">
                {Array.from(previousPlayers).map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Player 2 Name (Enter to score)"
                value={players.player2.name}
                onChange={(e) => setPlayers(prev => ({
                  ...prev,
                  player2: { ...prev.player2, name: e.target.value }
                }))}
                className="input-field"
                list="player-names"
                required
              />
            </div>
            <button type="submit" className="start-button">
              Start Game
            </button>
          </form>
          <PlayerStats/>
        </div>
      </div>
    );
  }

  return (
    <div className="fullscreen-container">
      <div className={`player-side left ${winner === 'player1' ? 'winner' : ''}`}>
        <div className="score-content">
          <div className="player-info">
            <h2 className="player-name">
              {players.player1.name}
              {winner === 'player1' && <Trophy className="trophy-icon" />}
            </h2>
            <div className="score-hint">(SPACE to score)</div>
          </div>
          <div className="huge-score">{players.player1.score}</div>
          <button 
            className="minus-button"
            onClick={() => updateScore('player1', -1)}
          >
            <Minus size={32} />
          </button>
        </div>
      </div>

      <div className={`player-side right ${winner === 'player2' ? 'winner' : ''}`}>
        <div className="score-content">
          <div className="player-info">
            <h2 className="player-name">
              {players.player2.name}
              {winner === 'player2' && <Trophy className="trophy-icon" />}
            </h2>
            <div className="score-hint">(ENTER to score)</div>
          </div>
          <div className="huge-score">{players.player2.score}</div>
          <button 
            className="minus-button"
            onClick={() => updateScore('player2', -1)}
          >
            <Minus size={32} />
          </button>
        </div>
      </div>

      <button onClick={resetGame} className="reset-button-fullscreen">
        Reset Game
      </button>
    </div>
  );
};

export default Home;