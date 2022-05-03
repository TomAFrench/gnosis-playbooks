import { Interface, ParamType } from "@ethersproject/abi";

import { Action, Transaction, Value } from "../types";
import { BatchTransaction, ContractInput, ContractMethod } from "../types/batchfile";

const fillTransactionTemplate = (transaction: Transaction, args: Record<string, Value>): BatchTransaction => {
  const target = args[transaction.to].value;
  const argumentArray = transaction.args.map(argumentId => args[argumentId].value);
  const contractInterface = new Interface([`function ${transaction.function}`]);

  const calldata = contractInterface.encodeFunctionData(transaction.function, argumentArray);

  const parsedFunction = Object.values(contractInterface.functions)[0];

  const contractMethod: ContractMethod = {
    name: parsedFunction.name,
    inputs: convertEthersToGnosisInput(parsedFunction.inputs),
    payable: parsedFunction.payable,
  };

  return {
    to: target,
    data: calldata,
    value: "0",
    contractMethod,
    // Just dump all args in for now. We can be cleaner later.
    contractInputsValues: Object.entries(args).reduce((acc: Record<string, string>, [key, value]) => {
      acc[key] = value.value;
      return acc;
    }, {}),
  };
};

const convertEthersToGnosisInput = (ethersParamType: ParamType[]): ContractInput[] => {
  return ethersParamType.map(input => ({
    internalType: input.baseType,
    name: input.name,
    type: input.type,
    components: Array.isArray(input.components) ? convertEthersToGnosisInput(input.components) : undefined,
  }));
};

export const fillTransactionTemplates = (action: Action, args: Record<string, Value>): BatchTransaction[] => {
  return action.transactions.map(transaction => fillTransactionTemplate(transaction, args));
};
