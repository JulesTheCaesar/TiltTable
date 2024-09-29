import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Switch, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer } from 'expo-sensors';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('screen');

export const TiltTable = () => {
	const [isBallSizeLarge, setIsBallSizeLarge] = useState(false);
	const toggleSwitch = () => setIsBallSizeLarge((prev) => !prev);

	const ballSize = useMemo(() => {
		return isBallSizeLarge ? width * 0.3 : width * 0.1;
	}, [isBallSizeLarge]);

	const ballPositionX = useSharedValue(width / 2);
	const ballPositionY = useSharedValue(height / 2);
	const ballSpeed = 200;

	useEffect(() => {
		const subscription = Accelerometer.addListener((accelerometerData) => {
			const { x, y } = accelerometerData;

			// Calculate the new position based on tilt
			const newPositionX = ballPositionX.value + x * ballSpeed;
			const newPositionY = ballPositionY.value - y * ballSpeed;

			// Update ball position
			ballPositionX.value = withSpring(
				Math.max(0, Math.min(width - ballSize, newPositionX)),
				{ overshootClamping: true }
			);
			ballPositionY.value = withSpring(
				Math.max(0, Math.min(height - ballSize, newPositionY)),
				{ overshootClamping: true }
			);
		});

		Accelerometer.setUpdateInterval(100);

		return () => {
			subscription.remove();
		};
	}, [ballSize]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: ballPositionX.value },
				{ translateY: ballPositionY.value },
			],
		};
	});

	return (
		<View style={styles.container}>
			<View style={styles.switchContainer}>
				<Text>Small</Text>
				<Switch onValueChange={toggleSwitch} value={isBallSizeLarge} />
				<Text>Large</Text>
			</View>
			<Animated.View
				style={[
					styles.ball,
					{ width: ballSize, height: ballSize },
					animatedStyle,
				]}
			/>
			<StatusBar />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	switchContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 10,
		position: 'absolute',
		top: 100,
		width: '100%',
	},
	ball: {
		borderRadius: 100,
		backgroundColor: 'violet',
		position: 'absolute',
		shadowColor: 'black',
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 5, // For Android shadow
	},
});
