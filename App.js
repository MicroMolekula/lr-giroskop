import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { Gyroscope } from 'expo-sensors';

const { width, height } = Dimensions.get('window');
const BALL_SIZE = 50;

export default function App() {
  const [position, setPosition] = useState({ x: width / 2, y: height / 2 });
  const [backgroundColor, setBackgroundColor] = useState('rgb(255, 255, 255)');
  const ballPosition = new Animated.ValueXY({ x: width / 2, y: height / 2 });

  useEffect(() => {
    Gyroscope.setUpdateInterval(16);
    const subscription = Gyroscope.addListener(({ x, y, z }) => {
      setPosition(prevPosition => {
        const newX = prevPosition.x - y * 10; // Инвертируем y для корректного направления
        const newY = prevPosition.y + x * 10; // Инвертируем x для корректного направления
        const clampedX = Math.max(BALL_SIZE / 2, Math.min(width - BALL_SIZE / 2, newX));
        const clampedY = Math.max(BALL_SIZE / 2, Math.min(height - BALL_SIZE / 2, newY));

        const red = Math.min(255, Math.max(0, Math.floor((clampedX / width) * 255)));
        const green = Math.min(255, Math.max(0, Math.floor((clampedY / height) * 255)));
        const blue = 255 - Math.floor((red + green) / 2);

        setBackgroundColor(`rgb(${red}, ${green}, ${blue})`);

        return { x: clampedX, y: clampedY };
      });
    });

    return () => subscription && subscription.remove();
  }, []);

  useEffect(() => {
    Animated.timing(ballPosition, {
      toValue: position,
      duration: 16,
      useNativeDriver: false,
    }).start();
  }, [position]);

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <Animated.View
        style={[
          styles.ball,
          {
            // Сделаем шарик невидимым
            opacity: 0,  // Это скрывает шарик, но он все равно будет в памяти и двигается
            left: ballPosition.x.interpolate({
              inputRange: [0, width],
              outputRange: [0, width - BALL_SIZE],
              extrapolate: 'clamp',
            }),
            top: ballPosition.y.interpolate({
              inputRange: [0, height],
              outputRange: [0, height - BALL_SIZE],
              extrapolate: 'clamp',
            }),
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: 'black', // Цвет не имеет значения, если шарик невидим
    position: 'absolute',
  },
});
