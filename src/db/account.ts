import { MongoClient, Db, Collection } from "mongodb";

import { Account } from "../@types/Account";

const dbName = "telegram";
const collectionName = "accounts";
const uri =
  "mongodb://qwerty:qwerty123@ac-llvczxo-shard-00-00.2ry9k50.mongodb.net:27017,ac-llvczxo-shard-00-01.2ry9k50.mongodb.net:27017,ac-llvczxo-shard-00-02.2ry9k50.mongodb.net:27017/?ssl=true&replicaSet=atlas-b2xf0l-shard-0&authSource=admin&retryWrites=true&w=majority";
class AccountService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<Account> | null = null;

  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;

    this.connect = this.connect.bind(this);

    this.updateAccountRemainingTime =
      this.updateAccountRemainingTime.bind(this);
    this.incrementMessageCount = this.incrementMessageCount.bind(this);
  }

  async connect() {
    if (this.client) {
      return;
    }

    this.client = await MongoClient.connect(uri);
    this.db = this.client.db(dbName);
    this.collection = this.db.collection(collectionName);
  }

  async incrementMessageCount(username: string) {
    await this.connect();
    if (!this.collection) {
      return;
    }

    const account = await this.collection.findOne({ username });

    if (!account) {
      throw new Error(`Account with username ${username} not found`);
    }

    const updatedData = {
      messageCount: (account.messageCount || 0) + 1,
    };

    await this.collection.updateOne({ username }, { $set: updatedData });
  }

  async updateAccountRemainingTime(username: string, remainingTime: number) {
    await this.connect();
    if (!this.collection) {
      return;
    }

    const currentTime = new Date();
    const futureTime = new Date(currentTime.getTime() + remainingTime);

    const updatedData = {
      remainingTime: futureTime,
    };

    await this.collection.updateOne({ username }, { $set: updatedData });
  }
}

export default new AccountService();
