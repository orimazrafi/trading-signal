import { z } from "zod";

/** Allowed trading actions for a saved watchlist signal. */
export const SIGNAL_ACTIONS = {
  BUY: "BUY",
  SELL: "SELL",
  HOLD: "HOLD",
} as const;

export const signalActionSchema = z.enum([
  SIGNAL_ACTIONS.BUY,
  SIGNAL_ACTIONS.SELL,
  SIGNAL_ACTIONS.HOLD,
]);

/** Trading recommendation action for a saved signal. */
export type SignalAction = z.infer<typeof signalActionSchema>;

/** Returns true when value is a known watchlist signal action. */
export function isSignalAction(value: string): value is SignalAction {
  return signalActionSchema.safeParse(value).success;
}
