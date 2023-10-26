import { MongoClient, Db, Collection } from "mongodb";

import { Message } from "../@types/Message";

const dbName = "telegram";
const collectionName = "messages";
const uri =
  "mongodb://qwerty:qwerty123@ac-llvczxo-shard-00-00.2ry9k50.mongodb.net:27017,ac-llvczxo-shard-00-01.2ry9k50.mongodb.net:27017,ac-llvczxo-shard-00-02.2ry9k50.mongodb.net:27017/?ssl=true&replicaSet=atlas-b2xf0l-shard-0&authSource=admin&retryWrites=true&w=majority";

class UsernameService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<Message> | null = null;

  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;

    this.connect = this.connect.bind(this);
    this.getUsername = this.getUsername.bind(this);
    this.updateMessage = this.updateMessage.bind(this);
    this.getFailedUsernames = this.getFailedUsernames.bind(this);
  }

  async connect() {
    if (this.client) {
      return;
    }

    this.client = await MongoClient.connect(uri);
    this.db = this.client.db(dbName);
    this.collection = this.db.collection(collectionName);
  }

  async getUsername() {
    await this.connect();
    if (!this.collection) {
      return null;
    }

    const count = await this.collection.countDocuments();
    if (count === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * count);
    const randomMessage = await this.collection
      .find({ failed: { $ne: true } })
      .limit(1)
      .skip(randomIndex)
      .next();

    return randomMessage;
  }

  async updateMessage(username: string, set = {}) {
    await this.connect();
    if (!this.collection) {
      return;
    }

    await this.collection.updateOne(
      { username: username.toLowerCase() },
      { $set: set },
      { upsert: true }
    );
  }

  async getFailedUsernames() {
    await this.connect();
    if (!this.collection) {
      return [];
    }

    const usernames = await this.collection.distinct("username", {
      failed: true,
    });
    return usernames.map((username) => username.toLowerCase());
  }
}

export default new UsernameService();
