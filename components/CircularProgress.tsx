import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

type CircularProgressProps = {
  size: number;
  strokeWidth: number;
  progress: number;
  backgroundColor: string;
  progressColor: string;
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  backgroundColor,
  progressColor,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <Circle
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
        {/* Progress Text */}
        <SvgText
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={size * 0.2}
          fill={progressColor}
        >
          {`${progress}%`}
        </SvgText>
      </Svg>
    </View>
  );
};

export default CircularProgress;
