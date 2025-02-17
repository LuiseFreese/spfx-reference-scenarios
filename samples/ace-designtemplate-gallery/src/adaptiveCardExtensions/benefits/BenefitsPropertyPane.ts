import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import * as strings from 'BenefitsAdaptiveCardExtensionStrings';

export class BenefitsPropertyPane {
  public getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('iconProperty', {
                  label: strings.IconPropertyFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
