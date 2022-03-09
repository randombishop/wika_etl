import { expect } from "chai";
import { PluginNeo4j } from "../plugins/neo4j";

const neo4j = new PluginNeo4j();

const testUser1 = "aaaaaaaaaaaaaaa";
const testUrl1 = "https://www.wika.network/";

const testUser2 = "bbbbbbbbbbbbbbb";
const testUrl2 =
  "https://randombishop.medium.com/are-cryptocurrencies-cool-590c2314c1fc";

const testUser3 = "ccccccccccccccc";
const testUrl3 = "https://github.com/randombishop/wika_etl";

const testUser4 = "dddddddddddddd";
const testUrl4 = "https://www.example.com";

describe("PluginNeo4j", function () {
  describe("URL CRUD", function () {
    describe("deleteUrl", function () {
      it("should delete a URL node if it exists", async function () {
        await neo4j.deleteUrl(testUrl1);
        const node = await neo4j.fetchUrl(testUrl1);
        expect(node).to.be.null;
      });
    });

    describe("createUrl", function () {
      it("should create a new URL node", async function () {
        const newNode = await neo4j.createUrl(testUrl1, 5);
        expect(newNode.url).to.equal(testUrl1);
        expect(newNode.numLikes).to.equal(5);
      });
    });

    describe("fetchUrl", function () {
      it("should fetch the URL node we just created", async function () {
        const node = await neo4j.fetchUrl(testUrl1);
        expect(node.url).to.equal(testUrl1);
        expect(node.numLikes).to.equal(5);
      });
    });

    describe("updateUrl", function () {
      it("should update the URL and add to numLikes", async function () {
        const updatedNode = await neo4j.updateUrl(testUrl1, 10);
        expect(updatedNode.url).to.equal(testUrl1);
        expect(updatedNode.numLikes).to.equal(15);
      });
    });
  });

  describe("USER CRUD", function () {
    describe("deleteUser", function () {
      it("should delete a User node if it exists", async function () {
        await neo4j.deleteUser(testUser1);
        const node = await neo4j.fetchUser(testUser1);
        expect(node).to.be.null;
      });
    });

    describe("createUser", function () {
      it("should create a new User node", async function () {
        const newNode = await neo4j.createUser(testUser1, 1);
        expect(newNode.address).to.equal(testUser1);
        expect(newNode.numLikes).to.equal(1);
      });
    });

    describe("fetchUser", function () {
      it("should fetch the User node we just created", async function () {
        const node = await neo4j.fetchUser(testUser1);
        expect(node.address).to.equal(testUser1);
        expect(node.numLikes).to.equal(1);
      });
    });

    describe("updateUser", function () {
      it("should update the User and add to numLikes", async function () {
        const updatedNode = await neo4j.updateUser(testUser1, 14);
        expect(updatedNode.address).to.equal(testUser1);
        expect(updatedNode.numLikes).to.equal(15);
      });
    });
  });

  describe("LIKES CRUD", function () {
    describe("deleteLIKES", function () {
      it("should delete a LIKE relation if it exists", async function () {
        await neo4j.deleteLIKES(testUser1, testUrl1);
        const relation = await neo4j.fetchLIKES(testUser1, testUrl1);
        expect(relation).to.be.null;
      });
    });

    describe("createLIKES", function () {
      it("should create a new LIKE relation", async function () {
        const newRelation = await neo4j.createLIKES(testUser1, testUrl1, 3);
        expect(newRelation.numLikes).to.equal(3);
      });
    });

    describe("fetchLIKES", function () {
      it("should fetch the LIKE relation we just created", async function () {
        const relation = await neo4j.fetchLIKES(testUser1, testUrl1);
        expect(relation.numLikes).to.equal(3);
      });
    });

    describe("updateLIKES", function () {
      it("should update the LIKES relation and add to numLikes", async function () {
        const updated = await neo4j.updateLIKES(testUser1, testUrl1, 12);
        expect(updated.numLikes).to.equal(15);
      });
    });
  });

  describe("delete Users and Urls", function () {
    it("should delete testUser2", async function () {
      await neo4j.deleteUser(testUser2);
      const node = await neo4j.fetchUser(testUser2);
      expect(node).to.be.null;
    });

    it("should delete testUser3", async function () {
      await neo4j.deleteUser(testUser3);
      const node = await neo4j.fetchUser(testUser3);
      expect(node).to.be.null;
    });

    it("should delete testUser4", async function () {
      await neo4j.deleteUser(testUser4);
      const node = await neo4j.fetchUser(testUser4);
      expect(node).to.be.null;
    });

    it("should delete testUrl2", async function () {
      await neo4j.deleteUrl(testUrl2);
      const node = await neo4j.fetchUrl(testUrl2);
      expect(node).to.be.null;
    });

    it("should delete testUrl3", async function () {
      await neo4j.deleteUrl(testUrl3);
      const node = await neo4j.fetchUrl(testUrl3);
      expect(node).to.be.null;
    });

    it("should delete testUrl4", async function () {
      await neo4j.deleteUrl(testUrl4);
      const node = await neo4j.fetchUrl(testUrl4);
      expect(node).to.be.null;
    });
  });

  describe("OWNS CRUD", function () {
    describe("deleteOWNS", function () {
      it("should delete a OWNS relation if it exists", async function () {
        await neo4j.deleteOWNS(testUser1, testUrl1);
        const relation1 = await neo4j.fetchOWNS(testUser1, testUrl1);
        expect(relation1).to.be.null;
        await neo4j.deleteOWNS(testUser4, testUrl4);
        const relation2 = await neo4j.fetchOWNS(testUser4, testUrl4);
        expect(relation2).to.be.null;
      });
    });

    describe("createOWNS", function () {
      it("should create a new OWNS relation", async function () {
        const newRelation = await neo4j.createOWNS(testUser1, testUrl1);
        expect(newRelation).to.be.not.null;
      });
    });

    describe("fetchOWNS", function () {
      it("should fetch the OWNS relation we just created", async function () {
        const relation = await neo4j.fetchOWNS(testUser1, testUrl1);
        expect(relation).to.be.not.null;
      });
    });
  });

  describe("handleLikeEvent", function () {
    it("should create a LIKES relation for new user and new url", async function () {
      await neo4j.handleLikeEvent(testUser2, testUrl2, 1);
      const user = await neo4j.fetchUser(testUser2);
      expect(user.address).to.equal(testUser2);
      expect(user.numLikes).to.equal(1);
      const url = await neo4j.fetchUrl(testUrl2);
      expect(url.url).to.equal(testUrl2);
      expect(url.numLikes).to.equal(1);
      const likes = await neo4j.fetchLIKES(testUser2, testUrl2);
      expect(likes.numLikes).to.equal(1);
    });

    it("should create a LIKES relation for new user and existing url", async function () {
      await neo4j.handleLikeEvent(testUser3, testUrl2, 1);
      const user = await neo4j.fetchUser(testUser3);
      expect(user.address).to.equal(testUser3);
      expect(user.numLikes).to.equal(1);
      const url = await neo4j.fetchUrl(testUrl2);
      expect(url.url).to.equal(testUrl2);
      expect(url.numLikes).to.equal(2);
      const likes = await neo4j.fetchLIKES(testUser3, testUrl2);
      expect(likes.numLikes).to.equal(1);
    });

    it("should create a LIKES relation for existing user and new url", async function () {
      await neo4j.handleLikeEvent(testUser2, testUrl3, 1);
      const user = await neo4j.fetchUser(testUser2);
      expect(user.address).to.equal(testUser2);
      expect(user.numLikes).to.equal(2);
      const url = await neo4j.fetchUrl(testUrl3);
      expect(url.url).to.equal(testUrl3);
      expect(url.numLikes).to.equal(1);
      const likes = await neo4j.fetchLIKES(testUser2, testUrl3);
      expect(likes.numLikes).to.equal(1);
    });

    it("should create a LIKES relation for existing user and existing url", async function () {
      await neo4j.handleLikeEvent(testUser1, testUrl3, 1);
      const user = await neo4j.fetchUser(testUser1);
      expect(user.address).to.equal(testUser1);
      expect(user.numLikes).to.equal(16);
      const url = await neo4j.fetchUrl(testUrl3);
      expect(url.url).to.equal(testUrl3);
      expect(url.numLikes).to.equal(2);
      const likes = await neo4j.fetchLIKES(testUser1, testUrl3);
      expect(likes.numLikes).to.equal(1);
    });

    it("should update an existing LIKES relation", async function () {
      await neo4j.handleLikeEvent(testUser1, testUrl1, 5);
      const user = await neo4j.fetchUser(testUser1);
      expect(user.address).to.equal(testUser1);
      expect(user.numLikes).to.equal(21);
      const url = await neo4j.fetchUrl(testUrl1);
      expect(url.url).to.equal(testUrl1);
      expect(url.numLikes).to.equal(20);
      const likes = await neo4j.fetchLIKES(testUser1, testUrl1);
      expect(likes.numLikes).to.equal(20);
    });
  });

  describe("handleUrlRegisteredEvent", function () {
    it("should create a OWNS relation for new user and new url", async function () {
      await neo4j.handleUrlRegisteredEvent(testUser4, testUrl4);
      const user = await neo4j.fetchUser(testUser4);
      expect(user.address).to.equal(testUser4);
      expect(user.numLikes).to.equal(0);
      const url = await neo4j.fetchUrl(testUrl4);
      expect(url.url).to.equal(testUrl4);
      expect(url.numLikes).to.equal(0);
      const owns = await neo4j.fetchOWNS(testUser4, testUrl4);
      expect(owns).to.be.not.null;
    });

    it("should create a OWNS relation for an existing user and existing url", async function () {
      await neo4j.handleUrlRegisteredEvent(testUser1, testUrl1);
      const user = await neo4j.fetchUser(testUser1);
      expect(user.address).to.equal(testUser1);
      const url = await neo4j.fetchUrl(testUrl1);
      expect(url.url).to.equal(testUrl1);
      const owns = await neo4j.fetchLIKES(testUser1, testUrl1);
      expect(owns).to.be.not.null;
    });
  });

  describe("dispose", function () {
    it("should close the driver", async function () {
      await neo4j.dispose();
    });
  });
});
