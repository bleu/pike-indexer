export function getActionPausedProtocolData(
  action: string,
  pauseState: boolean
) {
  switch (action) {
    case 'Mint':
      return {
        isMintPaused: pauseState,
      };
    case 'Borrow':
      return {
        isBorrowPaused: pauseState,
      };
    case 'Transfer':
      return {
        isTransferPaused: pauseState,
      };
    case 'Seize':
      return {
        isSeizePaused: pauseState,
      };
    default:
      throw new Error(`Unknown action type: ${action}`);
  }
}
