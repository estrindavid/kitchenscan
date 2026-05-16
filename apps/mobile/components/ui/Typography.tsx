import { Text, type TextProps, type TextStyle } from 'react-native';
import { typography as typo } from './theme';
import { useThemeColors } from './ThemeProvider';

type TypographyVariant = keyof typeof typo;

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
}

export function Typography({
  variant = 'body',
  color,
  style,
  ...props
}: TypographyProps) {
  const c = useThemeColors();
  return (
    <Text
      style={[typo[variant] as TextStyle, { color: color ?? c.text }, style]}
      {...props}
    />
  );
}
