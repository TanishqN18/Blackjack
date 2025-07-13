'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../app/components/ui/button';
import CardWrapper from '../app/components/ui/cardwrapper';
import { toast } from 'sonner';
import Image from 'next/image';

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
const deck = values.flatMap(value => suits.map(suit => `${value}_of_${suit}`));

const cardValue = (card) => {
  if (!card || card === 'back') return 0;
  const val = card.split('_')[0];
  if (['jack', 'queen', 'king'].includes(val)) return 10;
  if (val === 'ace') return 11;
  return parseInt(val);
};

const calculateScore = (cards) => {
  let total = cards.reduce((sum, card) => sum + cardValue(card), 0);
  let aces = cards.filter(c => typeof c === 'string' && c.startsWith('ace')).length;
  while (total > 21 && aces) {
    total -= 10;
    aces--;
  }
  return total;
};

const playSound = (name) => {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.play();
};

export default function Home() {
  const [userCards, setUserCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [showDealer, setShowDealer] = useState(false);
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [gameOver, setGameOver] = useState(false);

  const dealCard = () => deck[Math.floor(Math.random() * deck.length)];

  const startGame = () => {
    const player = [dealCard(), dealCard()];
    const dealer = [dealCard(), dealCard()];
    setUserCards(player);
    setDealerCards([dealer[0], 'back']);
    setShowDealer(false);
    setResult('');
    setStatus('');
    setGameOver(false);
    playSound('deal');
  };

  const hit = () => {
    if (gameOver) return;
    setStatus('Player hits...');
    const newCards = [...userCards, dealCard()];
    setUserCards(newCards);
    playSound('click');
    if (calculateScore(newCards) > 21) {
      setStatus('Player busted! Dealer wins.');
      stand();
    }
  };

  const stand = () => {
    if (gameOver) return;
    setStatus("Player stands. Dealer's turn...");

    let revealedDealer = [dealerCards[0]];
    while (calculateScore(revealedDealer) < 17) {
      revealedDealer.push(dealCard());
      setDealerCards([...revealedDealer]); // update UI with animation
      setStatus('Dealer draws another card...');
    }

    setShowDealer(true);

    const userScore = calculateScore(userCards);
    const dealerScore = calculateScore(revealedDealer);

    let outcome = '';

    if (userScore > 21) {
      outcome = 'You went over. You lose 😭';
      playSound('lose');
    } else if (dealerScore > 21) {
      outcome = 'Dealer busts! You win 😎';
      playSound('win');
    } else if (userScore > dealerScore) {
      outcome = 'You win 🎉';
      playSound('win');
    } else if (userScore < dealerScore) {
      outcome = 'Dealer wins 😤';
      playSound('lose');
    } else {
      outcome = "It's a draw 🤝";
      playSound('click');
    }

    setStatus('Dealer stands.');
    setResult(outcome);
    toast(outcome);

    setScore(prev => ({
      wins: outcome.includes('You win') ? prev.wins + 1 : prev.wins,
      losses:
        outcome.includes('You went over') || outcome.includes('Dealer wins')
          ? prev.losses + 1
          : prev.losses,
      draws: outcome.includes('draw') ? prev.draws + 1 : prev.draws,
    }));

    setGameOver(true);
  };

  const renderCards = (cards, hidden = false) =>
    cards.map((card, i) => (
      <motion.img
        key={i}
        src={hidden && card === 'back' ? '/cards/back.png' : `/cards/${card}.png`}
        alt={card}
        className="w-20 h-auto rounded shadow"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.15 }}
      />
    ));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6 bg-white text-black">
    <motion.div
      className="text-5xl font-extrabold tracking-wide bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, type: 'spring' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
  >
    🎴 Blackjack
  </motion.div>


      <div className="text-sm">
        Wins: {score.wins} | Losses: {score.losses} | Draws: {score.draws}
      </div>

      <div className="flex gap-3 justify-center">
        {!gameOver ? (
          <>
            <Button onClick={hit}>Hit</Button>
            <Button onClick={stand}>Stand</Button>
          </>
        ) : (
          <Button onClick={startGame}>Play Again</Button>
        )}
      </div>

      {result && <p className="text-yellow-500 font-bold mt-3">{result}</p>}
      {status && (
        <motion.p
          className="text-sm text-gray-600 italic"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {status}
        </motion.p>
      )}

      {/* Dealer section with image */}
      <div className="flex flex-col items-center gap-4 mt-4">
        <motion.img
          src="/ui/dealer.png"
          alt="Dealer"
          className="w-24 h-24 object-contain"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
        <div className="flex gap-2">
          {showDealer ? renderCards(dealerCards) : renderCards(dealerCards, true)}
        </div>
      </div>

      {/* Player section with image */}
      <div className="flex flex-col items-center gap-4 mt-4">
        <motion.img
          src="/ui/player.png"
          alt="Player"
          className="w-24 h-24 object-contain"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
        <div className="flex gap-2">
          {renderCards(userCards)}
        </div>
      </div>
    </div>
  );
}