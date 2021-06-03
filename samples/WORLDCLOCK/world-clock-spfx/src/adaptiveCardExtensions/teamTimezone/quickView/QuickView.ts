import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import { ITeamTimezoneAdaptiveCardExtensionProps, ITeamTimezoneAdaptiveCardExtensionState } from '../TeamTimezoneAdaptiveCardExtension';

import { Logger, LogLevel } from "@pnp/logging";

import { forEach, sortBy } from 'lodash';
import { DateTime } from 'luxon';
import { IPerson, IWCView } from '../../../webparts/worldClock/models/wc.models';
import { wc } from '../../../webparts/worldClock/services/wc.service';

export interface IQuickViewData {
  title: string;
  url: string;
  members: { displayName: string; currentTime: string; iconName: string; }[];
}

export interface IMemberTime {
  currentTime: string;
  dayNight: string;
}

export class QuickView extends BaseAdaptiveCardView<
  ITeamTimezoneAdaptiveCardExtensionProps,
  ITeamTimezoneAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 QuickView";

  private _getTime(member: IPerson): IMemberTime {
    let retVal: IMemberTime = { currentTime: "unknown", dayNight: "night" }
    try {
      if (member.IANATimeZone != undefined) {
        const userTime: DateTime = DateTime.now().setZone(member.IANATimeZone);
        if ((userTime.hour > 6) && (userTime.hour < 20)) {
          retVal.dayNight = "day";
        }
        retVal.currentTime = userTime.toLocaleString(DateTime.TIME_SIMPLE);
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getTime) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public get data(): IQuickViewData {
    let retVal: IQuickViewData = null;
    try {
      const view: IWCView = this.state.currentConfig.views[this.state.currentView];
      if (view) {
        const viewMembers: IPerson[] = sortBy(wc.GetTeamMembers(view.members), "offset");
        const members: { displayName: string; currentTime: string; iconName: string }[] = [];
        forEach(viewMembers, (vm: IPerson) => {
          let memberTime: IMemberTime = this._getTime(vm);
          members.push({ displayName: vm.displayName, currentTime: memberTime.currentTime, iconName: memberTime.dayNight });
        });
        retVal = { title: view.viewName, url: this.state.teamsUrl, members: members };
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (data) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}