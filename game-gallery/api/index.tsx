import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
import { JSX } from 'frog/jsx/jsx-runtime';
// import { pinata } from 'frog/hubs';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';
// import { PinataFDK } from 'pinata-fdk';
import { hexToNumber, keccak256, toBytes } from 'viem';
import { gnosis } from 'viem/chains';

import { getCharacterById } from '../graphql/characters.js';
import { getClassById } from '../graphql/classes.js';
import { getGameMetaForChainId } from '../graphql/games.js';
import { getItemById } from '../graphql/items.js';
// import { PINATA_JWT } from '../utils/constants.js';
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

// const fdk = new PinataFDK({
//   pinata_jwt: PINATA_JWT,
//   pinata_gateway: '',
// });

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api/game-gallery',
  title: 'CharacterSheets Gallery',
  ui: { vars },
  browserLocation: 'https://charactersheets.io',
  secret: process.env.SECRET,
  verify: 'silent',
  // hub: pinata(),
});

// app.use(
//   '/',
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   fdk.analyticsMiddleware({ frameId: 'character-sheets-game-gallery' }) as any,
// );

app.frame('/', c => {
  return c.res({
    image: (
      <Background>
        <VStack alignHorizontal="center" gap="24" paddingTop="24">
          <Heading color="white" weight="400">
            Welcome to CharacterSheets!
          </Heading>
          <Box height="34" marginBottom="8" marginTop="4" width="34">
            <Image height="48" src="/swords.png" width="52" />
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

  const gameObjectUrl = encodeURIComponent(
    JSON.stringify({
      description: game.description,
      experience: game.experience,
      image: game.image,
      name: game.name,
      numberOfCharacters: game.characters.length,
      numberOfItems: game.items.length,
    }),
  );

  return c.res({
    image: `/gameImg/:${gameObjectUrl}`,
    intents: [
      <Button action={`/characters/${game.characters[0]?.id}`}>
        Characters
      </Button>,
      <Button action={`/classes/${game.classes[0]?.id}`}>Classes</Button>,
      <Button action={`/items/${game.items[0]?.id}`}>Items</Button>,
      <Button.Link href={`https://charactersheets.io/games/gnosis/${game.id}`}>
        App
      </Button.Link>,
    ],
  });
});

app.image('/gameImg/:gameObjectUrl?', async c => {
  const gameObjectUrl = c.req.param('gameObjectUrl') ?? '';
  const game = JSON.parse(gameObjectUrl.slice(1));

  const imageText = await fetch(game.image).then(res => res.text());
  const isSvg = imageText.startsWith('<svg');

  if (isSvg) {
    const svgBuffer = Buffer.from(imageText);
    const svgBase64 = svgBuffer.toString('base64');

    game.image = `data:image/svg+xml;base64,${svgBase64}`;
  }

  return c.res({
    headers: {
      'cache-control': 'max-age=0',
    },
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
                        {game.numberOfCharacters} characters
                      </Text>
                    </HStack>
                    <HStack gap="12">
                      <Image height="24" src="/items.png" width="24" />
                      <Text color="white" size="18" weight="400">
                        {game.numberOfItems} items
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
  });
});

app.frame('/characters/:characterId?', async c => {
  const characterId = c.req.param('characterId') ?? '';

  if (!characterId) {
    return c.res({
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

  const characterObjectUrl = encodeURIComponent(
    JSON.stringify({
      characterId: character.characterId,
      description: character.description,
      experience: character.experience,
      // Max of 4 rendered classes
      heldClasses: character.heldClasses.slice(0, 4),
      image: character.image,
      name: character.name,
      numberOfHeldItems: character.heldItems.length.toString(),
    }),
  );

  return c.res({
    image: `/characterImg/:${characterObjectUrl}`,
    intents: [
      <Button action={`/characters/${sortedCharacterIds[nextCharacterIndex]}`}>
        Next
      </Button>,
      <Button action={`/games/${character.gameId}`}>Return</Button>,
      <Button.Link
        href={`https://warpcast.com/~/compose?text=CharacterSheets%20by%20%40raidguild&embeds[]=https://frames.charactersheets.io/api/game-gallery/characters/${character.id}`}
      >
        Share
      </Button.Link>,
      <Button.Link
        href={`https://charactersheets.io/games/gnosis/${character.gameId}`}
      >
        App
      </Button.Link>,
    ],
  });
});

app.image('/characterImg/:characterObjectUrl?', async c => {
  const characterObjectUrl = c.req.param('characterObjectUrl') ?? '';
  const character = JSON.parse(characterObjectUrl.slice(1));

  const imageText = await fetch(character.image).then(res => res.text());
  const isSvg = imageText.startsWith('<svg');

  if (isSvg) {
    const svgBuffer = Buffer.from(imageText);
    const svgBase64 = svgBuffer.toString('base64');

    character.image = `data:image/svg+xml;base64,${svgBase64}`;
  }

  return c.res({
    headers: {
      'cache-control': 'max-age=0',
    },
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
                    {shortendText(character.description, 170)}
                  </Text>
                  <HStack gap="8">
                    {character.heldClasses.map((heldClass: HeldClass) => (
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
                      INVENTORY ({character.numberOfHeldItems})
                    </Text>
                  </HStack>
                </VStack>
              </Column>
            </Columns>
          </Box>
        </Box>
      </Box>
    ),
  });
});

app.frame('/classes/:classId?', async c => {
  const classId = c.req.param('classId') ?? '';

  if (!classId) {
    return c.res({
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

  const classObjectUrl = encodeURIComponent(
    JSON.stringify({
      claimable: classEntity.claimable,
      classId: classEntity.classId,
      description: classEntity.description,
      image: classEntity.image,
      name: classEntity.name,
      numberOfHolders: classEntity.holders.length.toString(),
    }),
  );

  return c.res({
    image: `/classImg/:${classObjectUrl}`,
    intents: [
      <Button action={`/classes/${sortedClassIds[nextClassIndex]}`}>
        Next
      </Button>,
      <Button action={`/games/${classEntity.gameId}`}>Return</Button>,
      <Button.Link
        href={`https://warpcast.com/~/compose?text=CharacterSheets%20by%20%40raidguild&embeds[]=https://frames.charactersheets.io/api/game-gallery/classes/${classEntity.id}`}
      >
        Share
      </Button.Link>,
      <Button.Link
        href={`https://charactersheets.io/games/gnosis/${classEntity.gameId}`}
      >
        App
      </Button.Link>,
    ],
  });
});

app.image('/classImg/:classObjectUrl?', async c => {
  const classObjectUrl = c.req.param('classObjectUrl') ?? '';
  const classEntity = JSON.parse(classObjectUrl.slice(1));

  const imageText = await fetch(classEntity.image).then(res => res.text());
  const isSvg = imageText.startsWith('<svg');

  if (isSvg) {
    const svgBuffer = Buffer.from(imageText);
    const svgBase64 = svgBuffer.toString('base64');

    classEntity.image = `data:image/svg+xml;base64,${svgBase64}`;
  }

  return c.res({
    headers: {
      'cache-control': 'max-age=0',
    },
    image: (
      <Box
        backgroundColor="dark"
        grow
        height="100%"
        justifyContent="center"
        padding="16"
        width="100%"
      >
        <Box backgroundColor="cardBG" height="100%" padding="20">
          <Columns gap="8" padding="12">
            <Column paddingTop="40" width="1/2">
              <VStack gap="8">
                <Text color="white" size="20">
                  {classEntity.name}
                </Text>
                <Text color="white" size="12" weight="300">
                  {shortendText(classEntity.description, 170)}
                </Text>
              </VStack>
              <Columns gap="20" paddingTop="40">
                <Column width="1/2">
                  <Stat heading="CLASS ID" value={classEntity.classId} />
                </Column>

                <Column width="1/2">
                  <Stat
                    heading="HELD BY"
                    value={`${classEntity.numberOfHolders} character${
                      classEntity.numberOfHolders !== 1 ? 's' : ''
                    }`}
                  />
                </Column>
              </Columns>

              <Columns paddingTop="20">
                <Column width="1/2">
                  <Stat
                    heading="CLAIMABLE BY"
                    value={classEntity.claimable ? 'Anyone' : 'only GameMaster'}
                  />
                </Column>
              </Columns>
            </Column>
            <Column alignHorizontal="center" width="1/2">
              <Image
                height="100%"
                objectFit="contain"
                src={classEntity.image}
              />
            </Column>
          </Columns>
        </Box>
      </Box>
    ),
  });
});

app.frame('/items/:itemId?', async c => {
  const itemId = c.req.param('itemId') ?? '';

  if (!itemId) {
    return c.res({
      image: (
        <Background>
          <Text align="center" color="white" weight="300">
            No item ID provided.
          </Text>
        </Background>
      ),
      intents: [<Button action="/">Return</Button>],
    });
  }

  const { item } = await getItemById(gnosis.id, itemId);

  if (!item) {
    return c.res({
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

  const sortedItemIds = sortById(item.gameId, item.gameItems, 'item');

  const currentItemIndex = sortedItemIds.findIndex(
    c => c === itemId.toLowerCase(),
  );

  const nextItemIndex =
    currentItemIndex + 1 >= sortedItemIds.length ? 0 : currentItemIndex + 1;

  const itemObjectUrl = encodeURIComponent(
    JSON.stringify({
      craftable: item.craftable,
      description: item.description,
      image: item.image,
      name: item.name,
      numberOfEquippers: item.equippers.length.toString(),
      numberOfHolders: item.holders.length.toString(),
      supply: item.supply,
      totalSupply: item.totalSupply,
    }),
  );

  return c.res({
    image: `/itemImg/:${itemObjectUrl}`,
    intents: [
      <Button action={`/items/${sortedItemIds[nextItemIndex]}`}>Next</Button>,
      <Button action={`/games/${item.gameId}`}>Return</Button>,
      <Button.Link
        href={`https://warpcast.com/~/compose?text=CharacterSheets%20by%20%40raidguild&embeds[]=https://frames.charactersheets.io/api/game-gallery/items/${item.id}`}
      >
        Share
      </Button.Link>,
      <Button.Link
        href={`https://charactersheets.io/games/gnosis/${item.gameId}`}
      >
        App
      </Button.Link>,
    ],
  });
});

app.image('/itemImg/:itemObjectUrl?', async c => {
  const itemObjectUrl = c.req.param('itemObjectUrl') ?? '';
  const item = JSON.parse(itemObjectUrl.slice(1));

  const imageText = await fetch(item.image).then(res => res.text());
  const isSvg = imageText.startsWith('<svg');

  if (isSvg) {
    const svgBuffer = Buffer.from(imageText);
    const svgBase64 = svgBuffer.toString('base64');

    item.image = `data:image/svg+xml;base64,${svgBase64}`;
  }

  return c.res({
    headers: {
      'cache-control': 'max-age=0',
    },
    image: (
      <Box
        backgroundColor="dark"
        grow
        height="100%"
        justifyContent="center"
        padding="16"
        width="100%"
      >
        <Box backgroundColor="cardBG" height="100%" padding="20">
          <Columns gap="8" padding="12">
            <Column width="2/3">
              <VStack gap="8">
                <Text color="white" size="20">
                  {item.name}
                </Text>
                <Text color="white" size="12" weight="300">
                  {shortendText(item.description, 170)}
                </Text>
              </VStack>
              <Columns paddingTop="28">
                <Column width="1/2">
                  <Stat heading="ITEM ID" value={item.itemId} />
                </Column>
                <Column width="1/2">
                  <Stat
                    heading="HELD BY"
                    value={`${item.numberOfHolders} character${
                      item.numberOfHolders !== 1 ? 's' : ''
                    }`}
                  />
                </Column>
              </Columns>

              <Columns paddingTop="20">
                <Column width="1/2">
                  <Stat
                    heading="SOULBOUND?"
                    value={item.soulbound ? 'Yes' : 'No'}
                  />
                </Column>
                <Column width="1/2">
                  <Stat
                    heading="ITEM SUPPLY"
                    value={`${item.supply} / ${item.totalSupply}`}
                  />
                </Column>
              </Columns>

              <Columns paddingTop="20">
                <Column width="1/2">
                  <Stat
                    heading="EQUIPPED BY"
                    value={`${item.numberOfEquippers} character${
                      item.numberOfEquippers !== 1 ? 's' : ''
                    }`}
                  />
                </Column>
                <Column width="1/2">
                  <Stat
                    heading="CRAFTABLE?"
                    value={item.craftable ? 'Yes' : 'No'}
                  />
                </Column>
              </Columns>
            </Column>
            <Column alignHorizontal="center" width="1/3">
              <Image height="100%" objectFit="contain" src={item.image} />
            </Column>
          </Columns>
        </Box>
      </Box>
    ),
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

export const Stat = ({
  heading,
  value,
}: {
  heading: string;
  value: string;
}): JSX.Element => {
  return (
    <VStack gap="8">
      <Text tracking="3">
        <Box color="white" fontSize={{ custom: '18px' }} fontWeight="300">
          {heading}
        </Box>
      </Text>
      <Text color="white" size="14">
        {value}
      </Text>
    </VStack>
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

const shortendText = (text: string, length: number): string => {
  return text.length > length ? `${text.slice(0, length)}...` : text;
};
