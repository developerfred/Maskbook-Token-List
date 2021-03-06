  const { schema } = require("@uniswap/token-lists");
const Ajv = require("ajv");
const metadata = require("eth-contract-metadata");
const { EthereumAddress } = require("wallet.ts");
const Mainnet = require("./erc20/mainnet.json");
const Rinkeby = require("./erc20/rinkeby.json");
const SolanaMainnet = require("./erc20/mainnet-solana.json");
const SolanaDevnet = require("./erc20/devnet.json");
const SolanaTestnet = require("./erc20/testnet.json");
const package = require("../package.json");

function generateMaskbookTokenList() {
  const uniqueSet = new Set();
  return {
    name: "Maskbook",
    logoURI:
    "https://raw.githubusercontent.com/DimensionDev/Maskbook-Website/master/img/MB--CircleCanvas--WhiteOverBlue.svg",
    keywords: [
      "browser extension",
      "web3",
      "Solana",
      "Ethereum",
      "peer to peer",
      "encryption",
      "cryptography",
      "gundb",
      "privacy protection",
      "ownyourdata",
      "social network",
      "blockchain",
      "crypto",
      "dweb",
    ],
    timestamp: new Date().toISOString(),
    version: {
      major: Number.parseInt(package.version.split(".")[0]),
      minor: Number.parseInt(package.version.split(".")[1]),
      patch: Number.parseInt(package.version.split(".")[2]),
    },

    tokens: [
      ...Mainnet.map((x) => ({
        chainId: 1,
        ...x,
      })),

      ...Rinkeby.map((x) => ({
        chainId: 4,
        ...x,
      })),

      ...SolanaMainnet.map((x) => ({
        chainId: 5,
        ...x,
      })),

      ...SolanaTestnet.map((x) => ({
        chainId: 6,
        ...x,
      })),

      ...SolanaDevnet.map((x) => ({
        chainId: 7,
        ...x,
      })),

      ...Object.keys(metadata)
        .filter((key) => {
          const record = metadata[key];
          return (
            typeof record.symbol === "string" &&
            typeof record.decimals === "number" &&
            typeof record.name === "string" &&
            new RegExp("^[ \\w.'+\\-%/À-ÖØ-öø-ÿ]+$").test(record.name) &&
            EthereumAddress.isValid(key)
          );
        })
        .map((key) => ({
          chainId: 1,
          address: EthereumAddress.checksumAddress(key),
          symbol: metadata[key].symbol,
          decimals: metadata[key].decimals,
          name: metadata[key].name,
        })),
    ]
      .sort((a, z) => {
        if (a.name > z.name) return 1;
        if (a.name < z.name) return -1;
        return 0;
      })
      .filter((x) => {
        const key = x.address.toLowerCase();
        if (uniqueSet.has(key)) return false;
        uniqueSet.add(key);
        return true;
      }),
  };
}

const MaskbookTokenList = generateMaskbookTokenList();

const ajv = new Ajv();
const validate = ajv.compile(schema);
if (validate(MaskbookTokenList)) {
  process.stdout.write(JSON.stringify(MaskbookTokenList));
} else {
  console.error(validate.errors);
  process.exit(1);
}
