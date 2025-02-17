declare interface IMyMailAdaptiveCardExtensionStrings {
  TitleFieldLabel: string;
  MailTypeLabel: string;
  RefreshRateFieldLabel: string;
  MailTypeFocused: string;
  MailTypeOther: string;
  MailTypeAll: string;
  CardViewIntro: string;
  UnreadMailText: string;
  FocusedMailText: string;
  OtherMailText: string;
  QuickViewButton: string;

  PropertyPaneDescription: string;
  Title: string;
  SubTitle: string;
  PrimaryText: string;
  Description: string;

}

declare module 'MyMailAdaptiveCardExtensionStrings' {
  const strings: IMyMailAdaptiveCardExtensionStrings;
  export = strings;
}
