import { fillTransactionTemplates, fillVariableTemplates } from "./templating";
import { Argument, BatchTransaction, Playbook, Value } from "./types";
import { checkArgExistance, validateArgs } from "./validation";

export const buildActionTxs = (
  playbook: Playbook,
  actionId: string,
  args: Record<string, string>,
  msgSender: string,
): BatchTransaction[] => {
  const action = playbook.actions.find(action => action.id === actionId);
  if (action === undefined) throw new Error("Unknown action");

  // Check that user has provided all arguments specified by the playbook
  // As we're taking user input here also check that it makes sense for the types we expect for each argument

  validateArgs(action.args || [], args);

  let mergedArgs: Record<string, Value> = {
    ...playbook.constants,
    ...fillArguments(action.args || [], args),
    msgSender: { value: msgSender, type: "address" },
  };

  if (action.variables !== undefined) {
    // If we have intermediate variable which need to be calculated from the inputs
    // then check if we have all values we need to calculate these and add them to the object of argument values
    checkArgExistance(
      action.variables.flatMap(variable => variable.args),
      mergedArgs,
    );
    mergedArgs = {
      ...mergedArgs,
      ...fillVariableTemplates(action.variables, mergedArgs),
    };
  }

  // Final check that we have a value for every placeholder in the transactions array before we attempt to build it.
  checkArgExistance(
    action.transactions.flatMap(transaction => transaction.args),
    mergedArgs,
  );
  return fillTransactionTemplates(action, mergedArgs);
};

const fillArguments = (argumentTemplates: Argument[], args: Record<string, string>): Record<string, Value> => {
  const values: Record<string, Value> = {};
  for (const argumentTemplate of argumentTemplates) {
    values[argumentTemplate.id] = {
      value: args[argumentTemplate.id],
      type: argumentTemplate.type,
    };
  }

  return values;
};
