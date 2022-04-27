import { ModuleWithProviders, NgModule } from '@angular/core';
import { EventChannelService, EventChannelConfig } from './event-channel.service';

@NgModule()
export class EventChannelModule {
	public static forRoot(events: Object, config?: EventChannelConfig): ModuleWithProviders<EventChannelModule> {
		return {
			ngModule: EventChannelModule,
			providers: [
				EventChannelService,
				{
					provide: 'EVENTS',
					useValue: events,
				},
				{
					provide: 'config',
					useValue: config,
				},
			],
		};
	}
}
