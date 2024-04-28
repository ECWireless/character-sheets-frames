export const Heading = ({ children }: { children: string }): JSX.Element => (
  <div
    style={{
      color: 'white',
      fontSize: 54,
      letterSpacing: '-0.025em',
      lineHeight: 1.4,
      display: 'flex',
    }}
  >
    {children}
  </div>
);
