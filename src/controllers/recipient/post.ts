import { Request, Response } from "express";

import DialogueDB from "../../db/dialogue";
import GroupIdDB from "../../db/groupId";
import UsernameDB from "../../db/username";
import AccountDB from "../../db/account";
import { processAccounts } from "../../store";
import { generateRandomTime } from "../../modules/generateRandomTime";
import { wrapPromise } from "../../modules/wrapPromise";

export const postRecipient = async (req: Request, res: Response) => {
  try {
    const { status, username, groupId, accountId, dialogue } = req.body;

    if (!status || !username || !groupId || !accountId) {
      return res.status(400).send("Недостающее количество параметров");
    }

    if (status === "done") {
      if (!dialogue || !dialogue.accountId || !dialogue.href) {
        return res.status(400).send("Недостающее количество параметров");
      }

      await Promise.all([
        wrapPromise(() => DialogueDB.postDialogue(dialogue)),
        wrapPromise(() =>
          UsernameDB.updateMessage(username, {
            dateUpdated: new Date(),
          })
        ),
        wrapPromise(() => GroupIdDB.createOrUpdateCurrentCount(groupId)),
        wrapPromise(() => AccountDB.incrementMessageCount(accountId)),
        wrapPromise(() =>
          AccountDB.updateAccountRemainingTime(accountId, generateRandomTime())
        ),
      ]);
    } else if (status === "spam") {
      await wrapPromise(() =>
        AccountDB.updateAccountRemainingTime(accountId, generateRandomTime())
      );
    } else {
      await wrapPromise(() =>
        UsernameDB.updateMessage(username, {
          failed: true,
          dateUpdated: new Date(),
        })
      );
    }

    const index = processAccounts.indexOf(username);
    if (index !== -1) {
      processAccounts.splice(index, 1);
    }

    return res.status(200).send("OK");
  } catch (e) {
    console.log(e);
    return res.status(400).send("Произошла ошибка");
  }
};
