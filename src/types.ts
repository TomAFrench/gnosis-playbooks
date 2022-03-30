/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const VALUE_TYPES = ["address", "uint256", "bytes"] as const;
export type ValueType = typeof VALUE_TYPES[number];

export type Value = {
  value: string;
  type: ValueType;
};

export type Argument = {
  id: string;
  description?: string;
  type: ValueType;
};

const VARIABLE_TYPES = ["abiEncode", "functionCallData"] as const;
export type VariableType = typeof VARIABLE_TYPES[number];

export type Variable = {
  id: string;
  type: VariableType;
  function?: string;
  args: string[];
};

export type Transaction = {
  to: string;
  function: string;
  args: string[];
};

export type Action = {
  id: string;
  name: string;
  args?: Argument[];
  variables?: Variable[];
  transactions: Transaction[];
};

export type Playbook = {
  version: string;
  chainId: number;
  constants?: Record<string, Value>;
  actions: Action[];
};

export type GnosisTx = {
  to: string;
  data: string;
  value: string;
};

export const isValidValueType = (obj: unknown): obj is ValueType => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return VALUE_TYPES.includes(obj as any);
};

const isValue = (obj: any): obj is Argument => {
  if (obj === null || obj === undefined) return false;

  return (
    typeof obj === "object" &&
    typeof obj.value === "string" &&
    isValidValueType(obj.type)
  );
};

export const isArgument = (obj: any): obj is Argument => {
  if (obj === null || obj === undefined) return false;

  return (
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    (typeof obj.description === "undefined" || typeof obj.description === "string") &&
    isValidValueType(obj.type)
  );
};

export const isValidVariableType = (obj: unknown): obj is VariableType => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return VARIABLE_TYPES.includes(obj as any);
};

export const isVariable = (obj: any): obj is Variable => {
  if (obj === null || obj === undefined) return false;

  const validArgs =
    typeof obj.args === "undefined" ||
    (Array.isArray(obj.args) && obj.args.every((value: any) => typeof value === "string"));

  return typeof obj === "object" && typeof obj.id === "string" && isValidVariableType(obj.type) && validArgs;
};

export const isTransaction = (obj: any): obj is Transaction => {
  if (obj === null || obj === undefined || typeof obj !== "object") return false;
  return (
    typeof obj.to === "string" &&
    typeof obj.function === "string" &&
    Array.isArray(obj.args) &&
    obj.args.every((value: any) => typeof value == "string")
  );
};

export const isAction = (obj: any): obj is Action => {
  if (obj === null || obj === undefined || typeof obj !== "object") return false;

  const validArgs =
    typeof obj.args === "undefined" || (Array.isArray(obj.args) && obj.args.every((value: any) => isArgument(value)));
  const validVariables =
    typeof obj.variables === "undefined" ||
    (Array.isArray(obj.variables) && obj.variables.every((value: any) => isVariable(value)));
  const validTransactions =
    Array.isArray(obj.transactions) && obj.transactions.every((value: any) => isTransaction(value));
  return typeof obj.id === "string" && typeof obj.name === "string" && validArgs && validVariables && validTransactions;
};

export const isPlaybook = (obj: any): obj is Playbook => {
  if (obj === null || obj === undefined || typeof obj !== "object") return false;

  const validVersion = typeof obj.version === "string";
  const validChainId = typeof obj.chainId === "number";
  const validConstants =
    obj.constants === "undefined" ||
    (typeof obj.constants === "object" && Object.values(obj.constants).every((value: any) => isValue(value)));
  const validActions = Array.isArray(obj.actions) && obj.actions.every((value: any) => isAction(value));

  return validVersion && validChainId && validConstants && validActions;
};
