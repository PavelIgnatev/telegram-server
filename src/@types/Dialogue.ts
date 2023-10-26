export interface Dialogue {
  _id?: string;

  groupId: number;
  accountId: string;
  href: string;
  title: string;
  username: string;
  messages: Array<string>;
  viewed: boolean;

  bio?: string;
  phone?: string;
  blocked?: boolean;

  dateCreated: Date;
}
