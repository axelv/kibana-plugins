import React from 'react';
import { Plugin, CoreSetup, AppMountParameters } from 'kibana/public';
import { createServiceWrapper } from './services';
import { GreetingCardTemplate, GreetingCardPersonalization } from './types';
import { reactToUiComponent } from '../../../src/plugins/kibana_react/public';

export class GreetingCardsV2Plugin implements Plugin<void, void, {}, {}> {
  private greetingCardTemplates: Array<GreetingCardTemplate> = [];

  public setup(core: CoreSetup) {

    // We use an async wrapper to support code splitting practices, and help ensure
    // the setup function completes as fast as possible!
    this.registerGreetingCardTemplate(async () => {
      const { BirthdayGreetingCard } = await import('./templates');
      return {
        id: 'birthday',
        displayName: 'Birthday',
        render: (card: GreetingCardPersonalization) => {
          return reactToUiComponent(() => <BirthdayGreetingCard {...card} />);
        }
      }
    });

    this.registerGreetingCardTemplate(async () => {
      const { GetWellSoonGreetingCard } = await import('./templates');
      return {
        id: 'getWellSoon',
        displayName: 'Get well soon',
        render: (card: GreetingCardPersonalization) => {
          return reactToUiComponent(() => <GetWellSoonGreetingCard {...card} />);
        }
      }
    });

    const templates = this.greetingCardTemplates;
  
    core.application.register({
      id: 'greetingCardsV2',
      title: 'Greeting cards V2',
      async mount(params: AppMountParameters) {
        const [coreStart] = await core.getStartServices();
        const { renderApp } = await import('./app');
        const services = createServiceWrapper(coreStart);
        return renderApp(
          { appBasePath: params.appBasePath, services, templates },
          params.element);
      },
    });
  }

  public start() {}
  public stop() {}

  private async registerGreetingCardTemplate(getTemplate: () => Promise<GreetingCardTemplate>) {
    const template = await getTemplate();
    this.greetingCardTemplates.push(template);
  }
}
