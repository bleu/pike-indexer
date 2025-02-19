import { mergeAbis } from 'ponder';
import { FactoryAbiV0 } from './v0';
import { FactoryAbiV1 } from './v1';

export const FactoryAbi = mergeAbis([FactoryAbiV0, FactoryAbiV1]);
