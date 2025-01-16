import { pToken } from 'ponder:schema';
import { MathSol } from './math';
import { parseEther } from 'viem';

const BASE = parseEther('1');

export abstract class InterestRateModel {
  constructor(public pTokenData: typeof pToken.$inferSelect) {}

  abstract getUtilization(): bigint;

  abstract getBorrowRate(): bigint;

  abstract getSupplyRate(): bigint;
}

export class DoubleJumpRateModel extends InterestRateModel {
  getUtilization(): bigint {
    if (this.pTokenData.totalBorrows === 0n) {
      return 0n;
    }

    return MathSol.divDownFixed(
      this.pTokenData.totalBorrows,
      this.pTokenData.cash +
        this.pTokenData.totalBorrows -
        this.pTokenData.totalReserves
    );
  }

  getBorrowRate(): bigint {
    const util = this.getUtilization();

    if (util <= this.pTokenData.firstKink) {
      return (
        MathSol.mulDownFixed(util, this.pTokenData.multiplierPerSecond) +
        this.pTokenData.baseRatePerSecond
      );
    }

    let normalRate =
      MathSol.mulDownFixed(
        this.pTokenData.firstKink,
        this.pTokenData.multiplierPerSecond
      ) + this.pTokenData.baseRatePerSecond;

    if (util <= this.pTokenData.secondKink) {
      const excessUtil = util - this.pTokenData.firstKink;

      return (
        MathSol.mulDownFixed(
          excessUtil,
          this.pTokenData.firstJumpMultiplierPerSecond
        ) + normalRate
      );
    }

    normalRate += MathSol.mulDownFixed(
      this.pTokenData.secondKink - this.pTokenData.firstKink,
      this.pTokenData.firstJumpMultiplierPerSecond
    );

    const excessUtil = util - this.pTokenData.secondKink;

    return (
      MathSol.mulDownFixed(
        excessUtil,
        this.pTokenData.secondJumpMultiplierPerSecond
      ) + normalRate
    );
  }

  getSupplyRate(): bigint {
    const oneMinusReserveFactor =
      parseEther('1') - this.pTokenData.reserveFactor;
    const borrowRate = this.getBorrowRate();
    const rateToPool = MathSol.mulDownFixed(borrowRate, oneMinusReserveFactor);
    return MathSol.mulDownFixed(this.getUtilization(), rateToPool);
  }
}
