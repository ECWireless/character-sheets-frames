import { createSystem } from 'frog/ui';

export const {
  Box,
  Columns,
  Column,
  Heading,
  Image,
  Icon,
  HStack,
  Rows,
  Row,
  Spacer,
  Text,
  VStack,
  vars,
} = createSystem({
  colors: {
    dark: '#171922',
    cardBG: '#11131A',
    accent: '#a9c8eb',
    softgreen: '#79BA87',
    softpurple: '#9087B5',
    softyellow: '#FFEBA4',
    softblue: '#7B91DD',
    softorange: '#BA9179',
    white: '#FFFFFF',
  },
  fonts: {
    default: [
      {
        name: 'Unbounded',
        source: 'google',
        weight: 400,
      },
      {
        name: 'Unbounded',
        source: 'google',
        weight: 300,
      },
    ],
  },
});
