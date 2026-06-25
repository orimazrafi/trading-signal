import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import axios, { isAxiosError } from "axios";
import { env } from "../config/env.js";

/** Returns true when the server may proxy manual alert check triggers to alerts-runner. */
export function isAlertRunnerDevTriggerEnabled(): boolean {
  return env.nodeEnv === "development" && env.alertsRunnerUrl.length > 0;
}

/** Asks alerts-runner to evaluate all enabled alerts immediately (development only). */
export async function triggerAlertsRunnerCheck(): Promise<void> {
  if (!isAlertRunnerDevTriggerEnabled()) {
    throw new Error("Alert runner dev trigger is not enabled");
  }

  try {
    await axios.post(`${env.alertsRunnerUrl}/run-once`, {}, {
      timeout: 60_000,
    });
  } catch (error) {
    if (isAxiosError(error) && error.code === "ECONNREFUSED") {
      throw new Error(
        `Cannot reach alerts-runner at ${env.alertsRunnerUrl}. Start the alerts-runner service.`,
      );
    }

    if (isAxiosError(error) && error.response?.status === HTTP_STATUS.NOT_FOUND) {
      throw new Error(
        "alerts-runner dev endpoint not found. Rebuild alerts-runner with ALERT_RUNNER_DEV_HTTP=true.",
      );
    }

    throw error;
  }
}
