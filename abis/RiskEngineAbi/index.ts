import { mergeAbis } from 'ponder';
import { RiskEngineAbiV0 } from './v0';
import { RiskEngineAbiV1 } from './v1';

export const RiskEngineAbi = mergeAbis([RiskEngineAbiV0, RiskEngineAbiV1]);
