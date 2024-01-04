import { MongoClient, Db, Collection } from "mongodb";

import { GroupId } from "../@types/GroupId";

const dbName = "telegram";
const collectionName = "groupId";
const uri =
  "mongodb://qwerty:qwerty123@ac-llvczxo-shard-00-00.2ry9k50.mongodb.net:27017,ac-llvczxo-shard-00-01.2ry9k50.mongodb.net:27017,ac-llvczxo-shard-00-02.2ry9k50.mongodb.net:27017/?ssl=true&replicaSet=atlas-b2xf0l-shard-0&authSource=admin&retryWrites=true&w=majority";

class GroupIdService {
  private fullDocs: Array<GroupId> | null = null;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<GroupId> | null = null;
  private fullDocsFetchTime: number = Date.now();

  constructor() {
    this.connect = this.connect.bind(this);
    this.createOrUpdateCurrentCount =
      this.createOrUpdateCurrentCount.bind(this);
    this.getGroupId = this.getGroupId.bind(this);
    this.findByGroupId = this.findByGroupId.bind(this);
  }

  private async connect() {
    if (this.client) {
      return;
    }

    this.client = await MongoClient.connect(uri);
    this.db = this.client.db(dbName);
    this.collection = this.db.collection(collectionName);
  }

  public async createOrUpdateCurrentCount(groupId: GroupId["groupId"]) {
    await this.connect();
    if (!this.collection) {
      return;
    }

    const filter = { groupId };
    const update = {
      $inc: { currentCount: 1 },
      $set: { dateUpdated: new Date() },
    };
    const options = { upsert: true };

    await this.collection.updateOne(filter, update, options);
  }

  public async findByGroupId(groupId: GroupId["groupId"]) {
    await this.connect();
    if (!this.collection) {
      return;
    }

    const filter = { groupId };
    const foundDoc = await this.collection.findOne(filter);

    return foundDoc;
  }

  public async getGroupId() {
    await this.connect();
    if (!this.collection) {
      return;
    }

    const cacheTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds

    if (
      !this.fullDocs ||
      Date.now() - (this.fullDocsFetchTime || 0) > cacheTimeout
    ) {
      this.fullDocs = await this.collection.find().toArray();
      this.fullDocsFetchTime = Date.now();
    }

    this.fullDocs = this.fullDocs.filter(
      (doc) => doc.currentCount < doc.target
    );
    let currentIndex = this.fullDocs.findIndex((doc) => doc.current === true);

    if (currentIndex === -1) {
      currentIndex = 0;
    }

    this.fullDocs[currentIndex].current = false;
    const nextIndex = (currentIndex + 1) % this.fullDocs.length;
    console.log(nextIndex)
    this.fullDocs[nextIndex].current = true;

    return this.fullDocs[nextIndex];
  }
}
export default new GroupIdService();
