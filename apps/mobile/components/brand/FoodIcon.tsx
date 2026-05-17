import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Rect,
  type SvgProps,
} from 'react-native-svg';
import { brandColors } from '../ui/theme';

export type FoodIconType =
  | 'tomato'
  | 'lemon'
  | 'broccoli'
  | 'bread'
  | 'milk'
  | 'pasta'
  | 'can'
  | 'carrot';

type FoodIconProps = SvgProps & {
  type: FoodIconType;
  size?: number;
};

const ink = brandColors.ink;

export function FoodIcon({ type, size = 56, ...props }: FoodIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none" {...props}>
      {renderFood(type)}
    </Svg>
  );
}

function renderFood(type: FoodIconType) {
  switch (type) {
    case 'tomato':
      return (
        <G>
          <Circle cx="32" cy="35" r="19" fill={brandColors.coral} stroke={ink} strokeWidth="4" />
          <Path d="M25 18c3 5 11 5 14 0" stroke={ink} strokeWidth="4" strokeLinecap="round" />
          <Path d="M32 18l-5-8 7 4 6-5-1 9" fill={brandColors.green} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
          <Circle cx="25" cy="29" r="3" fill={brandColors.peachLight} />
        </G>
      );
    case 'lemon':
      return (
        <G>
          <Ellipse cx="32" cy="34" rx="22" ry="15" fill={brandColors.lemon} stroke={ink} strokeWidth="4" transform="rotate(-18 32 34)" />
          <Path d="M17 41c9-3 22-8 32-15" stroke={ink} strokeWidth="3" strokeLinecap="round" opacity="0.35" />
          <Circle cx="24" cy="28" r="3" fill={brandColors.white} opacity="0.8" />
        </G>
      );
    case 'broccoli':
      return (
        <G>
          <Path d="M29 35h8l4 18H25l4-18z" fill={brandColors.green} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
          <Circle cx="23" cy="27" r="10" fill={brandColors.mint} stroke={ink} strokeWidth="4" />
          <Circle cx="33" cy="20" r="12" fill={brandColors.green} stroke={ink} strokeWidth="4" />
          <Circle cx="44" cy="29" r="10" fill={brandColors.mint} stroke={ink} strokeWidth="4" />
        </G>
      );
    case 'bread':
      return (
        <G>
          <Path d="M15 30c0-11 8-19 18-19s18 8 18 19v19H15V30z" fill={brandColors.peach} stroke={ink} strokeWidth="4" />
          <Path d="M15 34h36v15H15V34z" fill={brandColors.cream} stroke={ink} strokeWidth="4" />
          <Path d="M27 24c2-3 7-3 10 0" stroke={ink} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
        </G>
      );
    case 'milk':
      return (
        <G>
          <Path d="M23 12h18l-4 10 7 8v24H20V30l7-8-4-10z" fill={brandColors.white} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
          <Path d="M23 37h18v11H23z" fill={brandColors.skyLight} stroke={ink} strokeWidth="3" />
          <Path d="M27 22h10" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        </G>
      );
    case 'pasta':
      return (
        <G>
          <Rect x="15" y="13" width="34" height="42" rx="5" fill={brandColors.sky} stroke={ink} strokeWidth="4" />
          <Rect x="21" y="20" width="22" height="13" rx="2" fill={brandColors.cream} stroke={ink} strokeWidth="3" />
          <Path d="M23 43c3-4 7 4 10 0s7 4 10 0" stroke={brandColors.lemon} strokeWidth="4" strokeLinecap="round" />
          <Line x1="21" y1="38" x2="43" y2="38" stroke={ink} strokeWidth="3" strokeLinecap="round" opacity="0.35" />
        </G>
      );
    case 'can':
      return (
        <G>
          <Ellipse cx="32" cy="17" rx="17" ry="6" fill={brandColors.skyLight} stroke={ink} strokeWidth="4" />
          <Path d="M15 17v30c0 3 8 6 17 6s17-3 17-6V17" fill={brandColors.white} />
          <Path d="M15 17v30c0 3 8 6 17 6s17-3 17-6V17" stroke={ink} strokeWidth="4" />
          <Rect x="20" y="27" width="24" height="13" rx="3" fill={brandColors.peach} stroke={ink} strokeWidth="3" />
          <Ellipse cx="32" cy="47" rx="17" ry="6" stroke={ink} strokeWidth="4" />
        </G>
      );
    case 'carrot':
      return (
        <G>
          <Path d="M23 18c5 1 16 7 22 17L24 53c-8-13-8-28-1-35z" fill={brandColors.coral} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
          <Path d="M24 18l-6-8 10 4 6-7 1 11" fill={brandColors.green} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
          <Path d="M28 31l8 3M25 40l6 2" stroke={ink} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        </G>
      );
  }
}
