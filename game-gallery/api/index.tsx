import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel';
import { hexToNumber, keccak256, toBytes } from 'viem';
import { gnosis } from 'viem/chains';

import { getCharacterById } from '../graphql/characters.js';
import { getClassById } from '../graphql/classes.js';
import { getGameMetaForChainId } from '../graphql/games.js';
import { HeldClass } from '../utils/types.js';
import {
  Box,
  Column,
  Columns,
  Heading,
  HStack,
  Image,
  Row,
  Rows,
  Text,
  vars,
  VStack,
} from '../utils/ui.js';

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  ui: { vars },
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

app.frame('/', c => {
  return c.res({
    title: 'Game Gallery',
    image: (
      <Background>
        <VStack alignHorizontal="center" gap="24" paddingTop="24">
          <Heading color="white" weight="400">
            Welcome to CharacterSheets!
          </Heading>
          <Box height="34" width="34">
            <svg
              width="100%"
              viewBox="0 0 438 409"
              fill="#fff"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.2302 0.47627C33.2455 4.60393 47.2608 8.89034 61.2761 13.018C70.8912 15.8756 80.5063 18.5745 89.9585 21.9083C93.2178 23.0196 96.6402 24.9247 99.0847 27.306C137.871 64.9312 176.495 102.556 215.281 140.34C219.681 144.627 219.681 144.627 224.081 140.34C234.674 130.021 245.43 119.543 256.023 109.224C285.194 81.1243 314.203 52.8658 343.374 24.9247C345.493 22.8609 348.915 21.5908 351.848 20.6383C372.871 14.1293 394.057 7.77905 415.243 1.4288C417.036 0.952536 418.828 0.635024 421.599 0C419.643 6.35024 417.851 11.9067 416.058 17.4632C410.517 34.9263 404.976 52.2307 399.109 69.6939C398.131 72.5515 396.339 75.4091 394.057 77.6317C354.945 115.892 315.832 153.993 276.557 192.254C272.32 196.381 272.32 196.381 276.557 200.509C295.135 218.607 313.877 236.864 332.455 254.962C336.366 258.772 337.507 258.614 339.626 253.851C346.633 238.61 351.36 222.893 351.36 206.065C351.36 202.414 352.663 200.826 356.574 200.826C363.256 200.985 369.938 200.826 376.457 200.826C378.738 200.826 380.694 201.303 380.368 204.002C379.39 213.209 378.901 222.417 377.108 231.466C372.545 253.057 363.745 273.06 349.893 290.682C347.285 294.016 347.611 296.08 350.545 298.938C378.738 326.085 406.769 353.55 434.799 380.856C439.199 385.142 439.036 385.46 434.473 389.429C428.769 394.668 423.228 400.065 417.851 405.78C413.939 409.908 413.613 410.067 409.539 406.257C381.509 378.951 353.478 351.645 325.448 324.339C321.047 320.052 321.047 320.052 315.832 323.704C294.647 338.309 271.179 347.358 245.267 350.692C240.215 351.327 235 351.327 229.785 351.645C226.363 351.962 224.733 350.692 224.896 347.199C225.059 341.008 225.059 334.816 224.896 328.625C224.896 325.291 226.2 324.021 229.785 323.862C246.897 323.704 263.031 319.576 278.513 312.591C279.979 311.956 281.283 311.003 283.076 310.051C281.772 308.463 280.794 307.193 279.654 306.082C260.749 287.666 241.845 269.25 222.941 250.676C220.17 247.977 218.703 248.294 216.096 250.835C197.355 269.25 178.45 287.507 159.709 305.923C155.798 309.733 155.961 310.051 160.85 312.432C176.658 319.893 193.606 323.386 211.044 324.656C214.466 324.815 215.933 326.244 215.77 329.578C215.607 335.61 215.607 341.802 215.77 347.835C215.933 351.645 213.977 352.756 210.555 352.597C178.45 351.01 149.116 341.802 123.041 323.069C118.152 319.576 118.152 319.576 114.078 323.545C86.2102 350.692 58.3426 377.839 30.4751 404.987C25.9119 409.432 26.0749 409.273 21.3488 404.987C20.534 404.193 19.5562 403.399 18.5784 402.605C16.1339 400.224 2.77046 389.429 0 385.142C0.162968 384.983 19.0673 366.568 19.2302 366.409C43.0236 343.389 66.654 320.211 90.4474 297.191C92.566 295.286 92.403 293.54 90.6103 291.317C79.8544 278.141 72.5209 263.059 67.3059 247.183C62.9057 234.006 60.6242 220.512 60.1353 206.7C59.9723 202.89 61.439 201.62 65.3503 201.62C71.3801 201.779 77.5729 201.779 83.6027 201.62C87.188 201.461 88.6547 202.573 88.8177 206.224C89.4696 222.576 93.3808 238.134 100.388 252.898C102.67 257.661 103.159 257.82 107.07 254.01C125.486 236.229 143.738 218.29 162.153 200.35C166.554 196.064 166.554 196.064 162.316 191.777C123.204 153.676 84.0916 115.733 45.1422 77.6317C43.5125 76.0441 41.7199 73.9803 41.068 71.9165C36.3419 57.946 32.1047 43.9754 27.5416 30.0049C24.6082 21.1146 21.6748 12.0655 18.9043 3.17512C19.2303 2.06383 19.2302 1.27005 19.2302 0.47627ZM46.6089 37.4664C46.283 37.6252 45.957 37.9427 45.6311 38.1015C48.7275 47.4681 51.6609 56.9934 54.9203 66.36C55.5722 68.2651 57.3648 69.8527 58.8315 71.2815C82.299 93.8248 105.766 116.368 129.071 138.912C183.013 191.301 236.793 243.849 290.735 296.239C297.58 302.907 297.743 302.907 304.914 296.398C308.988 292.587 308.988 292.587 305.077 288.777C220.007 206.065 134.938 123.195 49.8683 40.324C48.8905 39.2127 47.7497 38.419 46.6089 37.4664ZM57.6908 26.671C57.3648 27.1473 56.8759 27.6235 56.55 28.0998C58.0167 29.0524 59.6464 29.8461 60.7871 31.1162C144.879 112.876 228.807 194.635 312.736 276.553C320.884 284.491 318.929 283.538 326.262 275.442C328.707 272.743 328.707 270.52 325.773 267.821C247.223 191.301 168.672 114.781 90.1214 38.2602C88.9807 37.1489 87.6769 35.8789 86.2102 35.4026C76.758 32.3862 67.3059 29.5286 57.6908 26.671ZM382.975 27.1473C382.649 26.8298 382.486 26.5123 382.16 26.036C373.849 28.5761 365.375 31.1162 357.063 33.815C354.619 34.6088 352.174 36.0376 350.219 37.7839C312.41 74.2978 274.764 110.812 236.956 147.326C229.622 154.47 229.622 154.47 237.119 161.772C240.867 165.424 241.193 165.424 244.941 161.772C289.921 117.956 334.9 74.1391 380.042 30.1637C381.183 29.2111 382.16 28.0998 382.975 27.1473ZM394.383 38.1015C394.057 37.7839 393.731 37.6252 393.568 37.3077C392.265 38.419 391.124 39.5303 389.82 40.6415C361.789 67.9476 333.759 95.4124 305.728 122.56C288.78 138.912 271.831 155.263 254.719 171.615C251.949 174.155 251.46 176.06 254.556 178.601C256.186 179.871 257.653 181.299 258.957 182.728C261.564 185.745 263.52 185.268 266.29 182.728C305.077 144.944 343.863 107.16 382.649 69.3764C383.953 68.1063 385.257 66.5188 385.909 64.9312C388.679 55.8821 391.45 46.9918 394.383 38.1015ZM209.251 237.499C208.273 236.229 207.459 234.959 206.481 234.006C198.658 226.545 199.962 224.957 190.999 233.848C173.561 250.835 156.124 267.821 138.686 284.808C130.375 292.905 130.538 292.746 140.153 299.573C142.923 301.478 144.716 301.16 146.834 298.938C166.879 279.411 186.925 259.884 206.97 240.357C207.622 239.563 208.273 238.61 209.251 237.499ZM187.739 216.702C187.088 215.749 186.599 214.956 185.947 214.321C184.317 212.733 182.687 211.146 181.058 209.558C177.309 205.907 177.146 205.907 173.235 209.717C154.82 227.656 136.567 245.437 118.152 263.376C110.492 270.838 110.492 272.267 118.315 279.728C120.434 281.792 122.063 281.633 124.182 279.728C144.553 259.884 164.924 240.039 185.295 220.195C186.273 219.083 186.925 217.813 187.739 216.702Z"
                fill="#fff"
              />
            </svg>
          </Box>
          <VStack alignHorizontal="center" gap="4">
            <Text color="white" weight="300">
              Enter a game ID or address to
            </Text>
            <Text color="white" weight="300">
              view game on Gnosis chain.
            </Text>
          </VStack>
        </VStack>
      </Background>
    ),
    intents: [
      <TextInput placeholder="Game ID/address..." />,
      <Button action={`/games`}>View Game</Button>,
    ],
  });
});

app.frame('/games/:gameId?', async c => {
  const gameId = c.req.param('gameId') ?? c.inputText ?? '';

  if (!gameId) {
    return c.res({
      title: 'CharacterSheets Gallery',
      image: (
        <Background>
          <Text align="center" color="white" weight="300">
            No game ID/address provided.
          </Text>
        </Background>
      ),
      intents: [<Button action="/">Return</Button>],
    });
  }

  const game = await getGameMetaForChainId(gnosis.id, gameId);

  if (!game) {
    return c.res({
      title: 'CharacterSheets Gallery',
      image: (
        <Background>
          <Text align="center" color="white" weight="300">
            An error occurred
          </Text>
        </Background>
      ),
      intents: [<Button action="/">Return</Button>],
    });
  }

  const imageText = await fetch(game.image).then(res => res.text());
  const isSvg = imageText.startsWith('<svg');

  if (isSvg) {
    const svgBuffer = Buffer.from(imageText);
    const svgBase64 = svgBuffer.toString('base64');

    game.image = `data:image/svg+xml;base64,${svgBase64}`;
  }

  return c.res({
    title: 'CharacterSheets Gallery',
    image: (
      <Box
        backgroundColor="dark"
        grow
        height="100%"
        justifyContent="center"
        padding="16"
        width="100%"
      >
        <Rows gap="8" grow>
          <Row
            alignVertical="center"
            backgroundColor="cardBG"
            height="1/2"
            padding="24"
          >
            <HStack alignVertical="bottom" gap="20">
              <img src={game.image} alt={game.name} width={160} />
              <VStack gap="8">
                <Heading color="white" weight="400">
                  {game.name}
                </Heading>
                <Text color="white" weight="300" wrap="balance">
                  {game.description}
                </Text>
              </VStack>
            </HStack>
          </Row>
          <Row
            alignVertical="top"
            backgroundColor="cardBG"
            height="1/2"
            padding="24"
          >
            <Text
              color="white"
              size="12"
              tracking="3"
              weight="300"
              wrap="balance"
            >
              GAME TOTALS
            </Text>
            <Columns>
              <Column width="1/3">
                <Box paddingTop="24">
                  <HStack height="38">
                    <Image height="48" src="/xp-box-left.png" width="16" />
                    <Box
                      alignVertical="center"
                      borderBottom="4px solid"
                      borderTop="4px solid"
                      borderColor="xpBorder"
                      padding="12"
                    >
                      <HStack gap="12">
                        <Text color="softyellow" weight="700">
                          {game.experience}
                        </Text>
                        <Box paddingTop="2">
                          <Image height="14" src="/xp.png" width="20" />
                        </Box>
                      </HStack>
                    </Box>
                    <Box marginLeft="-2">
                      <Image height="48" src="/xp-box-right.png" width="16" />
                    </Box>
                  </HStack>
                </Box>
              </Column>
              <Column width="2/3">
                <Box paddingTop="10">
                  <VStack gap="12">
                    <HStack gap="12">
                      <Image height="24" src="/characters.png" width="24" />
                      <Text color="white" size="18" weight="400">
                        {game.characters.length} characters
                      </Text>
                    </HStack>
                    <HStack gap="12">
                      <Image height="24" src="/items.png" width="24" />
                      <Text color="white" size="18" weight="400">
                        {game.items.length} items
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </Column>
            </Columns>
          </Row>
        </Rows>
      </Box>
    ),
    intents: [
      <Button action={`/characters/${game.characters[0]?.id}`}>
        Characters
      </Button>,
      <Button action={`/classes/${game.classes[0]?.id}`} value="classes">
        Classes
      </Button>,
      <Button value="items">Items</Button>,
      <Button.Link href={`https://charactersheets.io/games/gnosis/${game.id}`}>
        App
      </Button.Link>,
    ],
  });
});

app.frame('/characters/:characterId?', async c => {
  const characterId = c.req.param('characterId') ?? '';

  if (!characterId) {
    return c.res({
      title: 'CharacterSheets Gallery',
      image: (
        <Background>
          <Text align="center" color="white" weight="300">
            No characeter ID provided.
          </Text>
        </Background>
      ),
      intents: [<Button action="/">Return</Button>],
    });
  }

  const { character } = await getCharacterById(gnosis.id, characterId);

  if (!character) {
    return c.res({
      title: 'CharacterSheets Gallery',
      image: (
        <Background>
          <Text align="center" color="white" weight="300">
            An error occurred
          </Text>
        </Background>
      ),
      intents: [<Button action="/">Return</Button>],
    });
  }

  const sortedCharacterIds = sortById(
    character.gameId,
    character.gameCharacters,
    'character',
  );

  const currentCharacterIndex = sortedCharacterIds.findIndex(
    c => c === characterId.toLowerCase(),
  );

  const nextCharacterIndex =
    currentCharacterIndex + 1 >= sortedCharacterIds.length
      ? 0
      : currentCharacterIndex + 1;

  return c.res({
    title: 'CharacterSheets Gallery',
    image: (
      <Box
        backgroundColor="dark"
        grow
        height="100%"
        justifyContent="center"
        padding="16"
        width="100%"
      >
        <Box backgroundColor="cardBG" padding="20" height="100%">
          <Box border="1px solid #fff" padding="20" height="100%">
            <Columns gap="20">
              <Column width="1/3">
                <Box position="relative">
                  <Image
                    borderRadius="10"
                    height="100%"
                    objectFit="cover"
                    src={character.image}
                    width="100%"
                  />
                  <Box
                    position="absolute"
                    transform="translateX(-50%)"
                    left="80"
                    bottom="24"
                  >
                    <HStack height="32">
                      <Image height="40" src="/xp-box-left.png" width="16" />
                      <Box
                        alignVertical="center"
                        borderBottom="4px solid"
                        borderTop="4px solid"
                        borderColor="xpBorder"
                        padding="8"
                        marginLeft="-1"
                      >
                        <Text color="softyellow" weight="700">
                          {character.experience}
                        </Text>
                      </Box>
                      <Box marginLeft="-2">
                        <Image height="40" src="/xp-box-right.png" width="16" />
                      </Box>
                    </HStack>
                  </Box>
                </Box>
              </Column>
              <Column width="2/3">
                <VStack gap="14">
                  <Heading color="white" size="20" weight="400">
                    {character.name.replace(/Ξ/g, 'E')}
                  </Heading>
                  <Text color="white" size="12" weight="300">
                    Character ID: {character.characterId}
                  </Text>
                  <Text color="white" size="12" weight="300">
                    {character.description.slice(0, 170)}...
                  </Text>
                  <HStack gap="8">
                    {/* Max of 4 rendered classes */}
                    {character.heldClasses.slice(0, 4).map(heldClass => (
                      <ClassTag {...heldClass} />
                    ))}
                  </HStack>
                  <HStack gap="12">
                    <Image height="16" src="/items.png" width="16" />
                    <Text
                      color="white"
                      size="12"
                      tracking="3"
                      weight="300"
                      wrap="balance"
                    >
                      INVENTORY ({character.heldItems.length.toString()})
                    </Text>
                  </HStack>
                </VStack>
              </Column>
            </Columns>
          </Box>
        </Box>
      </Box>
    ),
    intents: [
      <Button action={`/characters/${sortedCharacterIds[nextCharacterIndex]}`}>
        Next
      </Button>,
      <Button action={`/games/${character.gameId}`}>Return</Button>,
      <Button action="/">Share</Button>,
      <Button.Link
        href={`https://charactersheets.io/games/gnosis/${character.gameId}`}
      >
        App
      </Button.Link>,
    ],
  });
});

app.frame('/classes/:classId?', async c => {
  const classId = c.req.param('classId') ?? '';

  if (!classId) {
    return c.res({
      title: 'CharacterSheets Gallery',
      image: (
        <Background>
          <Text align="center" color="white" weight="300">
            No class ID provided.
          </Text>
        </Background>
      ),
      intents: [<Button action="/">Return</Button>],
    });
  }

  const { classEntity } = await getClassById(gnosis.id, classId);

  if (!classEntity) {
    return c.res({
      title: 'CharacterSheets Gallery',
      image: (
        <Background>
          <Text align="center" color="white" weight="300">
            An error occurred
          </Text>
        </Background>
      ),
      intents: [<Button action="/">Return</Button>],
    });
  }

  const sortedClassIds = sortById(
    classEntity.gameId,
    classEntity.gameClasses,
    'class',
  );

  const currentClassIndex = sortedClassIds.findIndex(
    c => c === classId.toLowerCase(),
  );

  const nextClassIndex =
    currentClassIndex + 1 >= sortedClassIds.length ? 0 : currentClassIndex + 1;

  return c.res({
    title: 'CharacterSheets Gallery',
    image: (
      <Box
        backgroundColor="dark"
        grow
        height="100%"
        justifyContent="center"
        padding="16"
        width="100%"
      >
        <Text>{classEntity.name}</Text>
      </Box>
    ),
    intents: [
      <Button action={`/classes/${sortedClassIds[nextClassIndex]}`}>
        Next
      </Button>,
      <Button action={`/games/${classEntity.gameId}`}>Return</Button>,
      <Button action="/">Share</Button>,
      <Button.Link
        href={`https://charactersheets.io/games/gnosis/${classEntity.gameId}`}
      >
        App
      </Button.Link>,
    ],
  });
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined';
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);

/*
COMPONENTS
*/

export const Background = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element => (
  <Box
    backgroundColor="cardBG"
    grow
    height="100%"
    justifyContent="center"
    width="100%"
  >
    <Box height="100%" left="0" position="absolute" top="0" width="100%">
      <Image height="100%" objectFit="cover" src="/RG_CS_bg.png" width="100%" />
    </Box>
    {children}
  </Box>
);

const colors = [
  'softgreen',
  'softpurple',
  'softblue',
  'softyellow',
  'softorange',
];

export const ClassTag = (heldClass: HeldClass): JSX.Element => {
  const { image, level, name } = heldClass;

  const bgColor = () => {
    const hexValue = keccak256(toBytes(name));
    const index = hexToNumber(hexValue) % colors.length;
    return colors[index] as
      | 'softgreen'
      | 'softpurple'
      | 'softblue'
      | 'softyellow'
      | 'softorange';
  };

  return (
    <Box
      backgroundColor={bgColor()}
      borderRadius="256"
      paddingBottom="6"
      paddingLeft="14"
      paddingRight="14"
      paddingTop="6"
    >
      <HStack gap="6">
        <Image height="20" objectFit="contain" src={image} width="20" />
        <Text color="dark" size="16" weight="700">
          {level}
        </Text>
      </HStack>
    </Box>
  );
};

/*
Helpers
*/

const sortById = (
  gameId: string,
  characterIds: string[],
  type: 'character' | 'class' | 'item',
): string[] => {
  return characterIds
    .map(id => id.split('-').pop())
    .sort((a, b) => Number(a) - Number(b))
    .map(id => `${gameId}-${type}-${id}`);
};
