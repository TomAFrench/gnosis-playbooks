import fs from "fs-extra";
import yaml from "js-yaml";
import path from "path";
import { exit } from "process";

import { Playbook, isPlaybook } from "../src";

export const loadPlaybookFromFile = async (playbookPath: string): Promise<Playbook> => {
  const playbookFilePath = path.resolve(__dirname, playbookPath);
  const possiblePlaybook = yaml.load(await fs.readFile(playbookFilePath, { encoding: "utf-8" }));

  if (!isPlaybook(possiblePlaybook)) {
    console.log("Invalid playbook");
    exit(1);
  }
  return possiblePlaybook;
};
