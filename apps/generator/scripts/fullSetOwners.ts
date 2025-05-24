import ZOGZ_EDITIONS_ABI from '../constants/ZOGZ_EDITIONS_ABI';
import { existsSync } from 'fs';
import { readFile, readdir, writeFile } from 'fs/promises';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import path from 'path';

function replaceBigIntWithNumber(obj: any): any {
  if (typeof obj === 'bigint') {
    return Number(obj);
  } else if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map((item) => replaceBigIntWithNumber(item));
    } else {
      const newObj: { [key: string]: any } = {};
      for (const key in obj) {
        newObj[key] = replaceBigIntWithNumber(obj[key]);
      }
      return newObj;
    }
  } else {
    return obj;
  }
}

async function fullSetHolders() {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`),
  });

  const fromBlock = 17191980;
  const toBlock = 19321626;

  let currentFromBlock = fromBlock;
  let currentToBlock = fromBlock + 799;

  let count = 0;

  // gather and store TransferSingle / TransferBatch events
  if (process.env.WRITE) {
    while (currentToBlock < toBlock) {
      console.log(`${currentFromBlock} - ${currentToBlock}`);

      const singleFile = `./data/zogz/editions/logs/zogz-transfer-single-${currentFromBlock}-${currentToBlock}.json`;
      const batchFile = `./data/zogz/editions/logs/zogz-transfer-batch-${currentFromBlock}-${currentToBlock}.json`;

      if (!existsSync(singleFile) || !existsSync(batchFile)) {
        await new Promise((res) => setTimeout(res, 500));
      }

      if (!existsSync(singleFile)) {
        const logs = await publicClient.getLogs({
          address:
            process.env.NEXT_PUBLIC_ZOGZ_EDITIONS_CONTRACT_ADDRESS!.toLowerCase() as `0x${string}`,
          event: parseAbiItem(
            'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
          ),
          fromBlock: BigInt(currentFromBlock),
          toBlock: BigInt(currentToBlock),
        });

        console.log(logs.length);

        await writeFile(singleFile, JSON.stringify(replaceBigIntWithNumber(logs)));
      }

      if (!existsSync(batchFile)) {
        const logs = await publicClient.getLogs({
          address:
            process.env.NEXT_PUBLIC_ZOGZ_EDITIONS_CONTRACT_ADDRESS!.toLowerCase() as `0x${string}`,
          event: parseAbiItem(
            'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
          ),
          fromBlock: BigInt(currentFromBlock),
          toBlock: BigInt(currentToBlock),
        });

        console.log(logs.length);

        await writeFile(batchFile, JSON.stringify(replaceBigIntWithNumber(logs)));
      }

      currentFromBlock += 799;
      currentToBlock += 799;
      count++;
    }
  }

  const items = await readdir('./data/zogz/editions/logs');
  const singleFiles = items.filter(
    (item) => item.startsWith('zogz-transfer-single') && item.endsWith('.json'),
  );
  const batchFiles = items.filter(
    (item) => item.startsWith('zogz-transfer-single') && item.endsWith('.json'),
  );

  const owners: Record<string, true> = {};

  for (let i = 0; i < singleFiles.length; i++) {
    const content = await readFile(`./data/zogz/editions/logs/${singleFiles[i]}`, 'utf8');
    const data = JSON.parse(content) as Array<{
      eventName: string;
      args: {
        operator: string;
        from: string;
        to: string;
        id: number;
        value: number;
      };
      address: string;
      blockHash: string;
      blockNumber: number;
      data: string;
      logIndex: number;
      removed: boolean;
      topics: string[];
      transactionHash: string;
      transactionIndex: number;
    }>;

    data.forEach((d) => {
      if (d.args.to && !owners[d.args.to]) {
        owners[d.args.to] = true;
      }
    });
  }

  for (let i = 0; i < batchFiles.length; i++) {
    const content = await readFile(`./data/zogz/editions/logs/${batchFiles[i]}`, 'utf8');
    const data = JSON.parse(content) as Array<{
      eventName: string;
      args: {
        operator: string;
        from: string;
        to: string;
        ids: number[];
        values: number[];
      };
      address: string;
      blockHash: string;
      blockNumber: number;
      data: string;
      logIndex: number;
      removed: boolean;
      topics: string[];
      transactionHash: string;
      transactionIndex: number;
    }>;

    data.forEach((d) => {
      if (d.args.to && !owners[d.args.to]) {
        owners[d.args.to] = true;
      }
    });
  }

  const ownersArray = Object.keys(owners);

  const tokenIds: number[] = [];
  for (let tokenId = 1; tokenId <= 100; tokenId++) {
    tokenIds.push(tokenId);
  }

  if (process.env.WRITE) {
    for (let i = 0; i < ownersArray.length; i++) {
      const owner = ownersArray[i];

      console.log(owner);

      const accounts = new Array(111).fill(owner);

      const file = `./data/zogz/editions/balanceOfBatch/${owner}.json`;

      if (existsSync(file)) {
        continue;
      }

      const balanceOfBatch = await publicClient.readContract({
        address:
          process.env.NEXT_PUBLIC_ZOGZ_EDITIONS_CONTRACT_ADDRESS!.toLowerCase() as `0x${string}`,
        functionName: 'balanceOfBatch',
        args: [accounts, tokenIds],
        abi: ZOGZ_EDITIONS_ABI,
      });

      await writeFile(file, JSON.stringify(replaceBigIntWithNumber(balanceOfBatch)));

      // await new Promise((res) => setTimeout(res, 100));
    }
  }

  const ownerItems = await readdir('./data/zogz/editions/balanceOfBatch');
  const ownerFiles = ownerItems.filter((item) => item.endsWith('.json'));

  let ownersCount = 0;
  let fullSetOwnersCount111 = 0;
  let fullSetOwnersCount100 = 0;

  const fullSetOwnersCount100Array: string[] = [];

  for (let i = 0; i < ownerFiles.length; i++) {
    const content = await readFile(`./data/zogz/editions/balanceOfBatch/${ownerFiles[i]}`, 'utf8');
    const data = JSON.parse(content) as number[];

    const hasSome = data.some((d) => d > 0);
    const hasAll = data.every((d) => d > 0);
    const hasAll100 = data.slice(0, 100).every((d) => d > 0);

    if (hasSome) {
      ownersCount++;
    }
    if (hasAll) {
      fullSetOwnersCount111++;
    }
    if (hasAll100) {
      fullSetOwnersCount100++;
      fullSetOwnersCount100Array.push(ownerFiles[i].replace('.json', ''));
    }
  }

  // console.log(Object.keys(owners));
  console.log(`${Object.keys(owners).length} users`);
  console.log(`${ownersCount} owners`);
  console.log(`${fullSetOwnersCount111} full set owners (111)`);
  console.log(`${fullSetOwnersCount100} full set owners (100)`);

  console.log(fullSetOwnersCount100Array);

  const rootDir = path.join(process.cwd(), '..', 'website', 'data');

  await writeFile(
    path.join(rootDir, 'allowlist.json'),
    JSON.stringify(fullSetOwnersCount100Array, null, 2),
  );
}

fullSetHolders();
