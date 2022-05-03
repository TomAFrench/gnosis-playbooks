import { expect } from "chai";
import { loadPlaybookFromFile } from "../scripts/loader";
import { Playbook, generateBatchFile } from "../src";

describe("generateBatchFile", () => {
  let playbook: Playbook;

  before(async () => {
    playbook = await loadPlaybookFromFile("../test/data/test-playbook.yaml");
  });

  describe("basic checks", () => {
    it("generates the expected metadata", () => {
      const safeAddress = "0x0000000000000000000000000000000000001234"
  
      const actionId = "simpleAction" 
      const action = playbook.actions.find((action) => action.id = actionId);
      if (action === undefined) throw new Error("Bad action")
  
      const batchFile = generateBatchFile(playbook, actionId, {}, safeAddress)
      
      expect(batchFile.meta.name).to.be.eq(action.name)
      expect(batchFile.version).to.be.eq("1.0")
      expect(batchFile.chainId).to.be.eq(playbook.chainId.toString())
      expect(batchFile.meta.createdFromSafeAddress).to.be.eq(safeAddress)
      expect(batchFile.createdAt).to.be.approximately(Date.now(), 1000);
    });
  })  
});
