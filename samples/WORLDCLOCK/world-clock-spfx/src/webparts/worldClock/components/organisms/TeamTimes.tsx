import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { chain, cloneDeep, Dictionary, find, groupBy, isEqual, merge, sortBy } from "lodash";
import Dialog from "../molecules/Dialog";
import strings from "WorldClockWebPartStrings";
import ManageViews from "../molecules/ManageViews";
import { IPerson, ISchedule, IView, Person, View } from "../../models/wc.models";
import { wc } from "../../services/wc.service";
import TimeCard from "../molecules/TimeCard";
import { DateTime } from "luxon";
import Profile from "../molecules/Profile";
import ButtonAction from "../atoms/ButtonAction";
import { Icons } from "../../models/wc.Icons";
import styles from "../WorldClock.module.scss";

export interface ITeamTimesProps {
  currentUser: IPerson;
  currentTime: DateTime;
  addToMeeting: (IPerson) => void;
  meetingMembers: IPerson[];
  saveProfile: (schedule: ISchedule) => Promise<boolean>;
}

export interface ITeamTimesState {
  needsConfig: boolean;
  manageViewsVisible: boolean;
  views: IView[];
  timeZoneView: any[];
  showProfile: boolean;
}

export class TeamTimesState implements ITeamTimesState {
  constructor(
    public needsConfig: boolean = false,
    public manageViewsVisible: boolean = false,
    public views: IView[] = [],
    public timeZoneView: any[] = [],
    public showProfile: boolean = false,

  ) { }
}

export default class TeamTimes extends React.Component<ITeamTimesProps, ITeamTimesState> {
  private LOG_SOURCE: string = "🔶 TeamTimes";

  constructor(props: ITeamTimesProps) {
    super(props);
    try {
      //TODO: Julie I need some help with the best way to do this.
      let timeZoneView: any[];
      let needsConfig = false;
      if ((wc.Config.members.length > 20) && (wc.Config.views.length == 0)) {
        needsConfig = true;
      } else {
        let defaultView: IView = wc.Config.views[wc.Config.defaultViewId];
        timeZoneView = this._sortTimeZones(defaultView);
      }
      this.state = new TeamTimesState(needsConfig, needsConfig, wc.Config.views, timeZoneView);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }

  }

  public shouldComponentUpdate(nextProps: Readonly<ITeamTimesProps>, nextState: Readonly<ITeamTimesState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }
  private _changeManageViewsVisibility = (visible: boolean): void => {
    this.setState({ manageViewsVisible: visible, needsConfig: false });
  }

  private _sortTimeZones(view: IView) {
    try {
      //TODO: Julie I need some help with the best way to do this.
      let timeZoneView: any[];

      //if ((wc.Config.members.length > 20) && (wc.Config.views.length == 0)) {
      //  needsConfig = true;
      //} else {

      let members: IPerson[] = view.members;
      timeZoneView = chain(members).groupBy("offset").map((value, key) => ({ offset: parseInt(key.toString()), members: value })).sortBy("offset").value();
      let dayTimeArray: any[] = [];
      for (let key in timeZoneView) {
        let groupMembers: IPerson[] = timeZoneView[key].members as IPerson[];
        let currentTime: DateTime = this.props.currentTime.setZone(groupMembers[0].IANATimeZone);
        let timeStyle: string = "";
        if (currentTime.hour > 6 && currentTime.hour <= 7) {
          timeStyle = "hoo-wcs-day";
        } else if (currentTime.hour > 7 && currentTime.hour <= 19) {
          timeStyle = "hoo-wcs-day";
        }
        else {
          timeStyle = "hoo-wcs-night";
        }
        dayTimeArray.push({ style: timeStyle, offset: timeZoneView[key].offset, members: timeZoneView[key].members });
      }
      timeZoneView = chain(dayTimeArray).groupBy("style").map((value, key) => ({ style: key, cardItems: value })).value();
      //}
      return timeZoneView;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_sortTimeZones) - ${err}`, LogLevel.Error);
    }
  }
  private _showProfile = (visible: boolean): void => {
    this.setState({ showProfile: visible });
  }

  private _saveView = async (view: IView, isDefault: boolean): Promise<void> => {
    try {
      let success: boolean = false;
      const config = cloneDeep(wc.Config);
      let a = find(config.views, { viewId: view.viewId });

      if (a) {
        config.views.map((v, index) => {
          if (v.viewId == a.viewId) {
            config.views[index] = view;
          }
        });
      } else {
        view.viewId = config.views.length.toString();
        config.views.push(view);
      }
      if (isDefault) {
        config.defaultViewId = view.viewId;
      }
      success = await wc.updateConfig(config);
      if (success) {
        let timeZoneView = this._sortTimeZones(view);
        this.setState({ manageViewsVisible: false, views: config.views, timeZoneView: timeZoneView });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_saveView) - ${err}`, LogLevel.Error);
    }
  }

  private _cancelView = () => {
    try {
      this._changeManageViewsVisibility(false);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_cancelView) - ${err}`, LogLevel.Error);
    }
  }
  private _saveProfile = async (schedule: ISchedule): Promise<void> => {
    try {
      let success: boolean = false;
      success = await this.props.saveProfile(schedule);
      if (success) {
        this.setState({ showProfile: false });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_saveView) - ${err}`, LogLevel.Error);
    }
  }

  private _cancelProfile = () => {
    try {
      this._showProfile(false);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_cancelView) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ITeamTimesProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <div className={styles.isRight}>
            <ButtonAction iconType={Icons.TeamView} onClick={() => this._changeManageViewsVisibility(true)} label={strings.ManageViewsLabel} />
          </div>
          <div className="hoo-wcs">
            {this.state.timeZoneView.map((m, index) => {
              return (<div className={`${m.style} ${(index == 0) ? "first" : (index == this.state.timeZoneView.length - 1) ? "last" : ""}`}>
                {m.cardItems.map((ci) => {
                  let members: IPerson[] = ci.members as IPerson[];
                  return (<TimeCard userId={this.props.currentUser.personId} members={members} currentTimeZone={wc.IANATimeZone} currentTime={this.props.currentTime} addToMeeting={this.props.addToMeeting} meetingMembers={this.props.meetingMembers} editProfile={this._showProfile} />);
                })}
              </div>);
            })}
          </div>
          <Dialog header={(this.state.needsConfig) ? strings.ConfigureViewsTitle : strings.ManageViewsTitle} content={(this.state.needsConfig) ? strings.ConfigureViewsContent : strings.ManageViewsContent} visible={this.state.manageViewsVisible} onChange={this._changeManageViewsVisibility} height={70} width={60}>
            <ManageViews save={this._saveView} cancel={this._cancelView} />
          </Dialog>
          <Dialog header="Edit Profile" content="Edit your profile to show your working days and hours" visible={this.state.showProfile} onChange={this._showProfile} height={70} width={60}>
            <Profile user={this.props.currentUser} save={this._saveProfile} cancel={this._cancelProfile} />
          </Dialog>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}