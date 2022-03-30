import { isAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { isBytesLike } from "@ethersproject/bytes";

import { Argument, ValueType, isValidValueType } from "./types";

const argumentValidators: Record<ValueType, (arg: string) => boolean> = {
  address: (arg: string) => isAddress(arg),
  uint256: (arg: string) => BigNumber.from(arg).toString() === arg,
  bytes: (arg: string) => isBytesLike(arg),
};

export const validateArgument = (input: string, argumentType: ValueType): boolean => {
  if (!isValidValueType(argumentType)) throw new Error("Unknown argument type");
  return argumentValidators[argumentType](input);
};

export const validateArgs = (requiredArguments: Argument[], args: Record<string, string>): boolean => {
  checkArgExistance(
    requiredArguments.map(argument => argument.id),
    args,
  );
  for (const argument of requiredArguments) {
    if (!validateArgument(args[argument.id], argument.type)) {
      throw new Error(`Invalid input for argument: ${argument.id} (${args[argument.id]})`);
    }
  }
  return true;
};

export const checkArgExistance = (requiredArgumentIds: string[], args: Record<string, unknown>): boolean => {
  const argumentIds = Object.keys(args);
  for (const argumentId of requiredArgumentIds) {
    if (!argumentIds.includes(argumentId)) {
      throw new Error(`Missing argument: ${argumentId}`);
    }
  }
  return true;
};
