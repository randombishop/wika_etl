import { expect } from "chai";
import { PluginNeo4j } from "../plugins/neo4j";
import { EventHandlers } from "../mappings/eventHandlers";

const eventHandlers = new EventHandlers();
const neo4j = new PluginNeo4j();

const testUser = "aaaaaaaaaaaaaaa";
const testUrl = "https://www.wika.network/";

// Mocking a Like Event as it would come from Polkadot API
const LIKE_EVENT = {
  idx: 5,
  event: {
    data: [
      {
        toString: () => {
          return testUser;
        },
      },
      {
        toString: () => {
          return testUser;
        },
        toHuman: () => {
          return {
            toString: () => {
              return testUrl;
            },
          };
        },
      },
      1,
    ],
  },
  extrinsic: {
    block: {
      block: {
        header: {
          hash: {
            toString: () => {
              return "test_hash_id";
            },
          },
          number: {
            toNumber: () => {
              return 123;
            },
          },
        },
      },
    },
  },
};

describe("handleLikeEvent", function () {
  it("should process the like event with no errors and increment the number of likes", async function () {
    const likesBefore = await neo4j.fetchLIKES(testUser, testUrl);
    const numLikesBefore = likesBefore != null ? likesBefore.numLikes : 0;
    await eventHandlers.handleLikeEvent(LIKE_EVENT);
    const likesAfter = await neo4j.fetchLIKES(testUser, testUrl);
    expect(likesAfter.numLikes).to.equal(numLikesBefore + 1);
  });
});
