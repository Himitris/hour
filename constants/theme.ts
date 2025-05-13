// constants/theme.ts
export const COLORS = {
  primary: '#3366FF', // Couleur principale
  primaryLight: '#5E9CFF',
  primaryLighter: '#92C1FF',
  primaryLightest: '#D1E8FF',

  secondary: '#33CC66', // Couleur secondaire pour les heures non notées
  secondaryLight: '#5EFF9C',
  secondaryLighter: '#92FFCB',
  secondaryLightest: '#D1FFE8',

  background: '#F8F9FC',
  card: '#FFFFFF',
  text: '#333333',
  textLight: '#777777',

  border: '#EEEEEE',
  inputBackground: '#F8F8F8',

  shadow: '#000000',
};

export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  bold: 'Inter-Bold',
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};
