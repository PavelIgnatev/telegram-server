import { MongoClient, Db, Collection } from "mongodb";

import { Dialogue } from "../@types/Dialogue";

const dbName = "telegram";
const collectionName = "dialogues";
const uri =
  "mongodb://qwerty:qwerty123@ac-llvczxo-shard-00-00.2ry9k50.mongodb.net:27017,ac-llvczxo-shard-00-01.2ry9k50.mongodb.net:27017,ac-llvczxo-shard-00-02.2ry9k50.mongodb.net:27017/?ssl=true&replicaSet=atlas-b2xf0l-shard-0&authSource=admin&retryWrites=true&w=majority";

class DialogueService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<Dialogue> | null = null;

  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;

    this.connect = this.connect.bind(this);
    this.postDialogue = this.postDialogue.bind(this);
    this.getDialogueUsername = this.getDialogueUsername.bind(this);
    this.getUsernamesByGroupId = this.getUsernamesByGroupId.bind(this);
  }

  async connect() {
    if (this.client) {
      return;
    }

    this.client = await MongoClient.connect(uri);
    this.db = this.client.db(dbName);
    this.collection = this.db.collection(collectionName);
  }

  async postDialogue(dialogue: Record<string, string>) {
    await this.connect();
    if (!this.collection) {
      return;
    }

    await this.collection.updateOne(
      { accountId: dialogue.accountId, href: dialogue.href },
      { $set: dialogue },
      { upsert: true }
    );
  }

  async getDialogueUsername(
    accountId: Dialogue["accountId"],
    username: Dialogue["username"]
  ) {
    await this.connect();
    if (!this.collection) {
      return null;
    }

    return await this.collection.findOne({
      accountId,
      username: username.toLowerCase(),
    });
  }

  async getUsernamesByGroupId(groupId: Dialogue["groupId"]) {
    await this.connect();
    if (!this.collection) {
      return [];
    }

    const usernames = await this.collection.distinct("username", {
      groupId,
    });
    return usernames.map((usernames) => usernames.toLowerCase());
  }
}

export default new DialogueService();
