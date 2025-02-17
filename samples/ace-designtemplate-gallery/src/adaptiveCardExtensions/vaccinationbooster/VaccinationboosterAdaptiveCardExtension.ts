import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { VaccinationboosterPropertyPane } from './VaccinationboosterPropertyPane';
import * as strings from 'VaccinationboosterAdaptiveCardExtensionStrings';

export interface IVaccinationboosterAdaptiveCardExtensionProps {
  iconProperty: string;
}

export interface IVaccinationboosterAdaptiveCardExtensionState {

}

const CARD_VIEW_REGISTRY_ID: string = 'Vaccinationbooster_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Vaccinationbooster_QUICK_VIEW';

export default class VaccinationboosterAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IVaccinationboosterAdaptiveCardExtensionProps,
  IVaccinationboosterAdaptiveCardExtensionState
> {
  private LOG_SOURCE: string = "🔶 Vaccination Booster Adaptive Card Extension";
  private _deferredPropertyPane: VaccinationboosterPropertyPane | undefined;

  public onInit(): Promise<void> {
    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Set the data into state
      this.state = {
      };
      //Register the cards
      this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
      this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onInit) - ${err}`, LogLevel.Error);
    }
    return Promise.resolve();
  }

  public get title(): string {
    return strings.Title;
  }

  protected get iconProperty(): string {
    return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'Vaccinationbooster-property-pane'*/
      './VaccinationboosterPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.VaccinationboosterPropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }
}
