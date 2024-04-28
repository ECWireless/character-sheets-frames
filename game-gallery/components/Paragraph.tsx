export const Paragraph = ({ children }: { children: string }): JSX.Element => (
  <div
    style={{
      color: 'white',
      fontSize: 32,
      fontStyle: 'normal',
      letterSpacing: '-0.025em',
      lineHeight: 1.4,
      display: 'flex',
    }}
  >
    {children}
  </div>
);
