import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

// Vector companion to the favicon: an ivory H within a gold prayer arch.
export function HidayahMark({ size = 56 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 64 64" accessible={false}>
    <Rect width="64" height="64" rx="17" fill="#003626" />
    <Path d="M13 47V30C13 19 26 11 32 8C38 11 51 19 51 30V47" fill="none" stroke="#D9B879" strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M21 22H30V24H28V31H36V24H34V22H43V24H40V43H43V45H34V43H36V34H28V43H30V45H21V43H24V24H21Z" fill="#F1FCF7" />
    <Path d="M29 53H35" stroke="#D9B879" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>;
}
