import { Action, Playbook, buildActionTxs } from ".";
import { BatchFile } from "./types/batchfile";

export const generateBatchFile = (
  playbook: Playbook,
  actionId: string,
  args: Record<string, string>,
  msgSender: string,
): BatchFile => {
  const transactions = buildActionTxs(playbook, actionId, args, msgSender);
  const action = playbook.actions.find((action: Action) => action.id === actionId);
  if (action === undefined) throw new Error("Unknown action");

  return {
    version: "1.0",
    chainId: playbook.chainId.toString() || "",
    createdAt: Date.now(),
    meta: {
      name: action.name,
      description: "",
      createdFromSafeAddress: msgSender,
    },
    transactions,
  };
};
