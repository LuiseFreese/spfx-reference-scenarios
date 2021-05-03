declare interface IWorldClockWebPartStrings {
  ConfigureViewsTitle: string;
  ConfigureViewsContent: string;
  ManageViewsTitle: string;
  ManageViewsContent: string;
  SelectAViewHeader: string;
  ViewTitleHeader: string;
  ViewMembersHeader: string;
  MakeDefaultViewHeader: string;
  MakeDefaultViewLabel: string;
  SaveLabel: string;
  CancelLabel: string;
  ManageViewsLabel: string;

}

declare module 'WorldClockWebPartStrings' {
  const strings: IWorldClockWebPartStrings;
  export = strings;
}
