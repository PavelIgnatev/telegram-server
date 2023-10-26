import GroupIdDB from "../db/groupId";
import UsernameDB from "../db/username";
import DialogueDB from "../db/dialogue";
import { processAccounts } from "../store";

export const getRecipientInfo = async (accountId: string) => {
  console.log("Начал генерировать информацию о пользователе");
  const response = await GroupIdDB.getGroupId();
  const { groupId = 12343207728, prompts, database = [] } = response ?? {};
  console.log(`Сгенерированный groupId: ${groupId}`);
  const [failedUsers, usersSender] = await Promise.all([
    UsernameDB.getFailedUsernames(),
    DialogueDB.getUsernamesByGroupId(groupId),
  ]);

  console.log("Перешел к генерации из локальной базы");
  for (let i = 0; i < database.length; i++) {
    const username = database[i].toLowerCase();

    if (
      !usersSender.includes(username) &&
      !failedUsers.includes(username) &&
      !processAccounts.includes(username)
    ) {
      const dialoque = await DialogueDB.getDialogueUsername(
        accountId,
        username
      );

      if (!dialoque) {
        processAccounts.push(username);
        console.log(
          `Username ${username} для groupId ${groupId} сгенерирован из локальной базы`
        );
        return { username, groupId, prompts };
      }
    }
  }

  console.log("Перешел к генерации из глобальной базы");
  while (true) {
    try {
      const randomUsername = await UsernameDB.getUsername();
      if (!randomUsername || !randomUsername.username) {
        continue;
      }

      const username = randomUsername.username.toLowerCase();
      if (
        usersSender.includes(username) ||
        failedUsers.includes(username) ||
        processAccounts.includes(username)
      ) {
        continue;
      }

      const dialoque = await DialogueDB.getDialogueUsername(
        accountId,
        username
      );

      if (!dialoque) {
        processAccounts.push(username);
        console.log(
          `Username ${username} для groupId ${groupId} сгенерирован из глобальной базы`
        );
        return { username, groupId, prompts };
      }
    } catch (e: any) {
      console.log(e.message);
    }
  }
};
