export const MailType = {
  "all": "all",
  "focused": "focused",
  "other": "other"
};
export interface IMessage {
  id: string;
  receivedDateTime: string;
  subject: string;
  importance: string;
  isRead: boolean;
  webLink: string;
  inferenceClassification: string;
  from: GraphUser;
}

export class Message implements IMessage {
  constructor(
    public id: string = "",
    public receivedDateTime: string = "",
    public subject: string = "",
    public importance: string = "",
    public isRead: boolean = true,
    public webLink: string = "",
    public inferenceClassification: string = "",
    public from: GraphUser = new GraphUser()
  ) { }
}

export interface IGraphUser {
  emailAddress: EmailAddress;
}

export class GraphUser implements IGraphUser {
  constructor(
    public emailAddress: EmailAddress = new EmailAddress(),
  ) { }
}

export interface IEmailAddress {
  name: string;
  address: string;
}

export class EmailAddress implements IEmailAddress {
  constructor(
    public name: string = "",
    public address: string = "",
  ) { }
}