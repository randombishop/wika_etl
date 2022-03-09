import fetch from "node-fetch";
import crypto from "crypto";
import Meta from "./meta";

/**
 * CRUD functions for website metadata in Elastic Search
 * CREATE: postUrl
 * READ: getUrl
 * UPDATE: postUrl
 * DELETE: deleteUrl
 */
export class PluginElasticSearch {
  private isEnabled: number;
  private host: string;
  private auth: string;

  /**
   * Constructor relies on env vars `ES_ENABLE`, `ES_HOST` and `ES_PASS`
   */
  constructor() {
    this.isEnabled = parseInt(process.env.ES_ENABLE);
    if (this.isEnabled == 1) {
      this.host = process.env.ES_HOST;
      const user = process.env.ES_USER;
      const password = process.env.ES_PASS;
      const buff = new Buffer(user + ":" + password);
      this.auth = "Basic " + buff.toString("base64");
    }
  }

  /**
   * Returns the state of the plugin configured by env variable `ES_ENABLE`
   * @returns true/false
   */
  isSyncEnabled(): boolean {
    return this.isEnabled == 1;
  }

  /**
   * Converts a URL into a MD5 hash to be used as the unique id for the webpage
   * @param url - Webpage url
   * @returns MD5 hash as a string
   */
  getUrlHash(url: string) {
    return crypto.createHash("md5").update(url).digest("hex");
  }

  /**
   * Calls the Elastic Search API and returns the parsed JSON result
   * @param path - API endpoint, for example `'/url/_doc/'
   * @param config - dictionary of options to be passed to the fetch function, for example `{method:'GET', headers:'...'}`
   * @returns JSON result parsed as a javascript dictionary
   */
  async callApiAndGetResult(path, config) {
    const response = await fetch(this.host + path, config);
    const data = await response.json();
    return data.result;
  }

  /**
   * Calls the Elastic Search API and returns the contents of the `_source` field when available
   * (the actual data found by Elastic Search)
   * @param path - API endpoint, for example `'/url/_doc/'
   * @param config - dictionary of options to be passed to the fetch function, for example `{method:'GET', headers:'...'}`
   * @returns the results found by Elastic Search
   */
  async callApiAndGetSource(path, config) {
    const response = await fetch(this.host + path, config);
    const data = await response.json();
    if (data.found) {
      return data._source;
    } else {
      return null;
    }
  }

  /**
   * Returns a document stored in Elastic Search by URL
   * @param url - Website URL
   * @returns document as dictionary if found, null otherwise.
   */
  async getUrl(url: string) {
    const rest_path = "/url/_doc/" + this.getUrlHash(url);
    const rest_config = {
      method: "get",
      headers: { Authorization: this.auth, "Content-Type": "application/json" },
    };
    const doc = await this.callApiAndGetSource(rest_path, rest_config);
    return doc;
  }

  /**
   * Updates or creates a document in Elastic Search
   * @remarks
   * The document id will be the MD5 hash of the url.
   * @param url - Website URL
   * @param data - Meta object that will be stored as a document
   * @returns document as dictionary if found, null otherwise.
   */
  async postUrl(url: string, data: Meta) {
    const rest_path = "/url/_doc/" + this.getUrlHash(url);
    const rest_config = {
      method: "post",
      body: JSON.stringify(data),
      headers: { Authorization: this.auth, "Content-Type": "application/json" },
    };
    const result = await this.callApiAndGetResult(rest_path, rest_config);
    return result;
  }

  /**
   * Deletes a document in Elastic Search by url
   * @param url - Website URL
   * @returns the response from the ES API.
   */
  async deleteUrl(url: string) {
    const rest_path = "/url/_doc/" + this.getUrlHash(url);
    const rest_config = {
      method: "delete",
      headers: { Authorization: this.auth, "Content-Type": "application/json" },
    };
    const result = await this.callApiAndGetResult(rest_path, rest_config);
    return result;
  }
}
