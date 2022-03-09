import { expect } from "chai";
import { PluginEmails } from "../plugins/emails";

const emails = new PluginEmails();

const testMessage = "Integration test message\nPlease ignore...";

describe("PluginEmails", function () {
  it("should send a test email if enabled", async function () {
    if (emails.isEnabled()) {
      await emails.sendError(testMessage);
    } else {
      console.warn("PluginEmails is disabled");
    }
  });
});
