import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from 'react-native';

const SnakeLadders: React.FC = () => {
  const [playerPositions, setPlayerPositions] = useState<number[]>([1, 1]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number>(0);
  const [winner, setWinner] = useState<number | null>(null);
  const playerColors = ['green', 'red'];

  // Animation state for player movement
  const playerAnimations = playerPositions.map(
    position => new Animated.Value(0),
  );

  // Function to handle dice roll
  // Function to handle dice roll
  const rollDice = () => {
    if (winner !== null) return; // Don't roll dice if winner is declared
    const diceValue = Math.floor(Math.random() * 6) + 1;
    if (currentPlayerIndex === 0) {
      setDiceValue(diceValue);
    }
    const currentPosition = playerPositions[currentPlayerIndex];
    const remainingSteps = 100 - currentPosition;

    // Check if the player is standing on position 96 and rolled a number greater than the remaining steps
    if (currentPosition >= 95 && diceValue > remainingSteps) {
      // Player is frozen, do not move
      setCurrentPlayerIndex((currentPlayerIndex + 1) % playerPositions.length);
    } else {
      // Proceed with normal movement logic
      let newPosition = currentPosition + diceValue;

      // Check if the newPosition is beyond position 100
      if (newPosition > 100) {
        // If the newPosition is beyond 100, adjust it to prevent overshooting
        newPosition = 100 - (newPosition - 100);
      }

      // Check if the player is in a position where they need an exact number to reach 100
      if (currentPosition >= 96 && newPosition > 100) {
        // If so, restrict the movement to only allow the exact number needed to reach 100
        newPosition = 100;
      }

      const updatedPositions = [...playerPositions];
      updatedPositions[currentPlayerIndex] = checkForLadderSnake(newPosition);
      animatePlayerMovement(
        currentPlayerIndex,
        updatedPositions[currentPlayerIndex],
      );
      setPlayerPositions(updatedPositions);

      // Check if any player has reached position 100
      if (updatedPositions.some(position => position >= 100)) {
        // Find the index of the winning player
        const winningPlayerIndex = updatedPositions.findIndex(
          position => position >= 100,
        );
        // Declare the winning player
        setWinner(winningPlayerIndex);
      } else {
        setCurrentPlayerIndex(
          (currentPlayerIndex + 1) % playerPositions.length,
        );
      }
    }
  };

  // Function to check for ladder or snake
  const checkForLadderSnake = (position: number): number => {
    const ladders: {[key: number]: number} = {
      4: 56,
      12: 50,
      14: 55,
      22: 58,
      41: 79,
      54: 88,
    };
    const snakes: {[key: number]: number} = {
      96: 42,
      94: 71,
      75: 32,
      48: 16,
      37: 3,
      28: 10,
    };

    if (ladders[position]) {
      return ladders[position];
    } else if (snakes[position]) {
      return snakes[position];
    } else {
      return position;
    }
  };

  // Function to animate player movement
  const animatePlayerMovement = (playerIndex: number, newPosition: number) => {
    const currentPosition = playerPositions[playerIndex];
    const steps = Math.abs(newPosition - currentPosition); // Calculate number of steps
    const durationPerStep = 2000; // Duration for each step in milliseconds
    let animatedValue = currentPosition;

    for (let i = 0; i <= steps; i++) {
      Animated.timing(playerAnimations[playerIndex], {
        toValue: animatedValue,
        duration: durationPerStep,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      // Update animatedValue for next step
      animatedValue += newPosition > currentPosition ? 1 : -1;

      // Delay the next step to ensure sequential movement
      setTimeout(() => {}, i * durationPerStep);
    }
  };

  // Effect to automatically roll dice for the second player after the first player
  useEffect(() => {
    if (currentPlayerIndex === 1 && winner === null) {
      const delay = setTimeout(() => {
        rollDice();
      }, 1000);
      return () => clearTimeout(delay);
    }
  }, [currentPlayerIndex, winner]);

  // Function to reset the game
  const resetGame = () => {
    setPlayerPositions([1, 1]);
    setCurrentPlayerIndex(0);
    setDiceValue(0);
    setWinner(null);
  };
  // Generate numbers from 100 to 1, with every second row reversed
  const generateNumbers = (): number[] => {
    const rows = [];
    for (let i = 0; i < 10; i++) {
      const row = [];
      if (i % 2 === 0) {
        for (let j = i * 10 + 1; j <= (i + 1) * 10; j++) {
          row.push(j);
        }
      } else {
        for (let j = (i + 1) * 10; j > i * 10; j--) {
          row.push(j);
        }
      }
      rows.push(row);
    }
    return rows.flat();
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          height: 400,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={require('./assets/images/snakesBoard.png')}
          resizeMode="stretch"
          style={{position: 'absolute', height: '100%', width: '100%'}}
        />
        <View style={styles.board}>
          {/* Render the board with 100 squares */}
          {generateNumbers().map((number, index) => (
            <View key={index} style={[styles.square]}>
              {/* Only render the player token if the index matches the player's position */}
              {playerPositions.map((position, playerIndex) => {
                if (number === position) {
                  return (
                    <Animated.View
                      key={playerIndex}
                      style={[
                        styles.player,
                        {
                          backgroundColor: playerColors[playerIndex],
                          left: '20%',
                          bottom: '50%',
                          borderWidth:2,
                          borderColor:"white",
                          transform: [
                            {
                              translateY: playerAnimations[
                                playerIndex
                              ].interpolate({
                                inputRange: [0, 100],
                                outputRange: [0, 90], // Adjust the output range based on your board layout
                              }),
                            },
                          ],
                          marginLeft: playerIndex * 10, // Adjust the marginLeft based on the number of players to prevent overlapping
                        },
                      ]}
                    />
                  );
                }
              })}
            </View>
          ))}
          {/* Render player tokens */}
        </View>
      </View>
      <Text style={{color: 'white'}}>
        Player 1 Position: {playerPositions[0]} Dice:{diceValue}
      </Text>
      {winner !== null && (
        <Text style={{color: 'white'}}>Player {winner + 1} wins!</Text>
      )}
      {winner === null && <Button title="Roll Dice" onPress={rollDice} />}
      {winner !== null && <Button title="Reset Game" onPress={resetGame} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242355',
    height: '100%',
    width: '100%',
    gap: 10,
    color: 'black',
  },

  board: {
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 360,
    flexDirection: 'row',
    flexWrap: 'wrap-reverse',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  square: {
    width: '10%',
    height: '10%',
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
  },
  player: {
    position: 'absolute',
    width: '45%',
    aspectRatio: 1,
    borderRadius: 30,
    zIndex: 100,
    elevation: 5, // Add elevation to ensure the player tokens render above the board
  },
});

export default SnakeLadders;
