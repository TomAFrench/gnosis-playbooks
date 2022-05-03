/* eslint-disable no-console */
import { BaseTransaction } from "@gnosis.pm/safe-apps-sdk";
import { encodeMulti } from "ethers-multisend";
import inquirer from "inquirer";

import { Action, BatchTransaction, Playbook, buildActionTxs, validateArgument } from "../src";
import { loadPlaybookFromFile } from "./loader";

const selectAction = async (playbook: Playbook): Promise<Action> => {
  const actions = playbook.actions;
  const { action } = await inquirer.prompt([
    {
      type: "list",
      message: "Which action do you want to perform",
      choices: actions.map(a => ({
        name: a.name,
        value: a,
      })),
      name: "action",
    },
  ]);
  return action;
};

const enterArguments = async (action: Action): Promise<Record<string, string>> => {
  if (!Array.isArray(action.args) || action.args.length == 0) return {};
  const args = await inquirer.prompt(
    action.args.map(arg => ({
      type: "input",
      message: arg.id,
      name: arg.id,
      validate: input => validateArgument(input, arg.type),
    })),
  );
  return args;
};

const chooseEncoding = async (): Promise<string> => {
  const { encoding } = await inquirer.prompt([
    {
      type: "list",
      message: "Choose encoding",
      choices: ["Transaction Builder", "Gnosis SDK", "Raw"],
      name: "encoding",
    },
  ]);
  return encoding;
};

const batchToRawTxs = (batchTransactions: BatchTransaction[]): BaseTransaction[] =>
  batchTransactions.map(tx => ({
    to: tx.to,
    data: tx.data ?? "",
    value: tx.value,
  }));

const main = async () => {
  const playbook = await loadPlaybookFromFile("../examples/sample-playbook.yaml");
  const selectedAction = await selectAction(playbook);
  const args = await enterArguments(selectedAction);

  const msgSender = "0x5Af0D9827E0c53E4799BB226655A1de152A425a5";
  const txs = buildActionTxs(playbook, selectedAction.id, args, msgSender);

  const encoding = await chooseEncoding();
  if (encoding === "Transaction Builder") {
    console.log(txs);
  } else if (encoding === "Gnosis SDK") {
    console.log(batchToRawTxs(txs));
  } else {
    let safeTx;
    if (txs.length === 1) {
      safeTx = {
        operation: 0,
        ...txs[0],
      };
    } else {
      safeTx = encodeMulti(batchToRawTxs(txs));
    }

    console.log(safeTx);
  }
};

void main();
