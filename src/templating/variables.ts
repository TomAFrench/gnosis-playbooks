import { Interface, defaultAbiCoder } from "@ethersproject/abi";

import { Value, Variable } from "../types";

const fillVariableTemplate = (variable: Variable, args: Record<string, Value>): Value => {
  if (variable.type === "functionCallData") {
    if (!variable.function) throw new Error("Missing function signature when constructing function calldata");
    const argumentArray = variable.args.map(argumentId => args[argumentId].value);
    const calldata = new Interface([`function ${variable.function}`]).encodeFunctionData(
      variable.function,
      argumentArray,
    );
    return {
      value: calldata,
      type: "bytes",
    };
  } else if (variable.type === "abiEncode") {
    const types = variable.args.map(argumentId => args[argumentId].type);
    const values = variable.args.map(argumentId => args[argumentId].value);
    const bytesData = defaultAbiCoder.encode(types, values);
    return {
      value: bytesData,
      type: "bytes",
    };
  }

  throw new Error("Unknown variable type");
};

export const fillVariableTemplates = (
  variableTemplates: Variable[],
  args: Record<string, Value>,
): Record<string, Value> => {
  return Object.fromEntries(
    variableTemplates.map(variableTemplate => [variableTemplate.id, fillVariableTemplate(variableTemplate, args)]),
  );
};
