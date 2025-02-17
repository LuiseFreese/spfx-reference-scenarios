import { ISPFxAdaptiveCard, BaseAdaptiveCardView, IActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import { find } from '@microsoft/sp-lodash-subset';
import * as strings from 'PayslipAdaptiveCardExtensionStrings';

import { Logger, LogLevel } from "@pnp/logging";

import { PayPeriod, Payslip } from '../../../common/models/designtemplate.models';
import { IPayslipAdaptiveCardExtensionProps, IPayslipAdaptiveCardExtensionState } from '../PayslipAdaptiveCardExtension';

export interface IQuickViewData {
  payslip: Payslip;
  currentPayPeriod: PayPeriod;
  currentPayPeriodStart: string;
  currentPayPeriodEnd: string;
  nextPayPeriod: PayPeriod;
  prevPayPeriod: PayPeriod;
  nextPayLabel: string;
  prevPayLabel: string;
  showNext: boolean;
  showPrev: boolean;
  separator: string;
  strings: IPayslipAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IPayslipAdaptiveCardExtensionProps,
  IPayslipAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 Payslip Quick View";

  public get data(): IQuickViewData {
    const payslip: Payslip = find(this.state.payslips, { payPeriod: this.state.currentPayPeriod.id });
    const showPrev = (this.state.currentIndex == 0) ? false : true;
    const showNext = (this.state.currentIndex == this.state.payPeriods.length - 1) ? false : true;
    const separator: string = require('../../../common/images/payslip/img_spacer.png');

    return {
      payslip: payslip,
      currentPayPeriod: this.state.currentPayPeriod,
      currentPayPeriodStart: Intl.DateTimeFormat(this.context.pageContext.cultureInfo.currentUICultureName, { weekday: undefined, year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(this.state.currentPayPeriod.startDate)),
      currentPayPeriodEnd: Intl.DateTimeFormat(this.context.pageContext.cultureInfo.currentUICultureName, { weekday: undefined, year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(this.state.currentPayPeriod.endDate)),
      nextPayPeriod: this.state.payPeriods[this.state.currentIndex + 1],
      prevPayPeriod: this.state.payPeriods[this.state.currentIndex - 1],
      nextPayLabel: `${Intl.DateTimeFormat(this.context.pageContext.cultureInfo.currentUICultureName, { weekday: undefined, year: undefined, month: 'long', day: 'numeric' }).format(new Date(this.state.payPeriods[this.state.currentIndex + 1].startDate))}-${Intl.DateTimeFormat(this.context.pageContext.cultureInfo.currentUICultureName, { weekday: undefined, year: undefined, month: undefined, day: 'numeric' }).format(new Date(this.state.payPeriods[this.state.currentIndex + 1].endDate))}`,
      prevPayLabel: `${Intl.DateTimeFormat(this.context.pageContext.cultureInfo.currentUICultureName, { weekday: undefined, year: undefined, month: 'long', day: 'numeric' }).format(new Date(this.state.payPeriods[this.state.currentIndex - 1].startDate))}-${Intl.DateTimeFormat(this.context.pageContext.cultureInfo.currentUICultureName, { weekday: undefined, year: undefined, month: undefined, day: 'numeric' }).format(new Date(this.state.payPeriods[this.state.currentIndex - 1].endDate))}`,
      showNext: showNext,
      showPrev: showPrev,
      separator: separator,
      strings: strings
    };
  }

  public async onAction(action: IActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id, payPeriodId } = action.data;
        if (id === 'next') {
          let currentIndex = this.state.currentIndex + 1;
          const currentPayPeriod: PayPeriod = this.state.payPeriods[currentIndex];

          this.setState({ currentPayPeriod: currentPayPeriod, currentIndex: currentIndex });
        } else if (id === 'prev') {
          let currentIndex = this.state.currentIndex - 1;
          const currentPayPeriod: PayPeriod = this.state.payPeriods[currentIndex];

          this.setState({ currentPayPeriod: currentPayPeriod, currentIndex: currentIndex });
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onAction) - ${err}`, LogLevel.Error);
    }
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}