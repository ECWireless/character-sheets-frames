import { colors } from '../utils/theme.js';

export const Background = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element => (
  <div
    style={{
      alignItems: 'center',
      background: colors.dark,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'center',
      padding: '32px',
      textAlign: 'center',
      width: '100%',
    }}
  >
    <div
      style={{
        alignItems: 'center',
        background: colors.cardBG,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
      }}
    >
      {children}
    </div>
  </div>
);
