import { Interface } from "@ethersproject/abi";
import { BaseTransaction } from "@gnosis.pm/safe-apps-sdk";

import { Action, Transaction, Value } from "../types";

const fillTransactionTemplate = (transaction: Transaction, args: Record<string, Value>): BaseTransaction => {
  const target = args[transaction.to].value;
  const argumentArray = transaction.args.map(argumentId => args[argumentId].value);
  const calldata = new Interface([`function ${transaction.function}`]).encodeFunctionData(
    transaction.function,
    argumentArray,
  );

  return {
    to: target,
    data: calldata,
    value: "0",
  };
};

export const fillTransactionTemplates = (action: Action, args: Record<string, Value>): BaseTransaction[] => {
  return action.transactions.map(transaction => fillTransactionTemplate(transaction, args));
};
