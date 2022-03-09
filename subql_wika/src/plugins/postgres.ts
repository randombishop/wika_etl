import {
  BlockInfo,
  LikeEvent,
  UrlRegisteredEvent,
  UrlMetadata,
} from "../types";

/**
 * Glue code to convert parameters into Subquery generated types,
 * then save to the database.
 * @remarks
 * The BlockInfo, LikeEvent, UrlRegisteredEvent, UrlMetadata rely on subquery framework
 * global service `store` so this plugin is only usable inside the subquery sandbox.
 */
export class PluginPostgres {
  private isEnabled: number;

  /**
   * Constructor relies on env var `DB_ENABLE`
   */
  constructor() {
    this.isEnabled = parseInt(process.env.DB_ENABLE);
  }

  /**
   * Returns the state of the plugin configured by env variable `DB_ENABLE`
   * @returns true/false
   */
  isSyncEnabled(): boolean {
    return this.isEnabled == 1;
  }

  /**
   * Saves and returns a new BlockInfo instance.
   * @param blockId - Block hash as string
   * @param blockNum - Block height as number
   * @returns The BlockInfo instance
   */
  async newBlockInfo(blockId, blockNum) {
    const record = new BlockInfo(blockId);
    record.blockNum = blockNum;
    record.syncDate = new Date();
    await record.save();
    return record;
  }

  /**
   * Saves and returns a new LikeEvent instance.
   * @param eventId - Unique event identifier
   * @param blockNum - Block height as number
   * @param url - Webpage url
   * @param user - User address
   * @param numLikes -Number of likes sent to the page
   * @returns The LikeEvent instance
   */
  async newLikeEvent(eventId, blockNum, url, user, numLikes) {
    const record = new LikeEvent(eventId);
    record.url = url;
    record.user = user;
    record.numLikes = numLikes;
    record.blockNum = blockNum;
    await record.save();
    return record;
  }

  /**
   * Saves and returns a MetadataRecord instance.
   * @param url - Webpage url
   * @param metadata - metadata dictionary containing `title`, `description`, `image`, `icon` and `updatedAt` fields
   * @returns The UrlMetadata instance
   */
  async newMetadataRecord(url, metadata) {
    const record = new UrlMetadata(url);
    record.title = metadata.title;
    record.description = metadata.description;
    record.image = metadata.image;
    record.icon = metadata.icon;
    record.updatedAt = metadata.updatedAt;
    await record.save();
    return record;
  }

  /**
   * Saves and returns a new UrlRegisteredEvent instance.
   * @remarks
   * The new instance is created with status `active` set to `true`
   * @param eventId - Unique event identifier
   * @param blockNum - Block height as number
   * @param url - Webpage url
   * @param owner - the new registered owner for the webpage
   * @returns The UrlRegisteredEvent instance
   */
  async newUrlRegisteredEvent(eventId, blockNum, url, owner) {
    const record = new UrlRegisteredEvent(eventId);
    record.url = url;
    record.owner = owner;
    record.active = true;
    record.blockNum = blockNum;
    await record.save();
    return record;
  }

  /**
   * This iterates over previous owner records for a given `url`
   * and sets the active state to `false`.
   * Must be called before registering a new ownership to ensure only the last one is flagged as active.
   * @param url - Webpage url
   */
  async deactivatePreviousUrlRegisteredEvents(url) {
    const previousRecords = await UrlRegisteredEvent.getByUrl(url);
    if (previousRecords != null) {
      for (let i = 0; i < previousRecords.length; i++) {
        let previousRecord = previousRecords[i];
        previousRecord.active = false;
        await previousRecord.save();
      }
    }
  }
}
