import {Inject, Injectable, ModuleWithProviders, NgModule} from '@angular/core';
import {Subject,Observable,of} from 'rxjs';

interface ServiceEvent {
  type: string;
  subj: Subject<any>;
}

@Injectable({
  providedIn: 'root',
})
export class EventChannelService {

  private eventBrocker: ServiceEvent[] = [];

  constructor(@Inject('EVENTS') private events: {}) {
    this.parseEvents(events);
  }

  on<T>(eventType: string): Observable<T | null> {
    const _event$ = this.eventBrocker.find(event => event.type === eventType);

    if (_event$) {
      return _event$.subj.asObservable();
    }

    console.error(`Подписка на несуществующее событие ${eventType}`);
    return of(null);
  }

  dispatch<T>(eventType: string, payload?: T): void {
    const _event$ = this.eventBrocker.find(ev => ev.type === eventType);

    if (_event$) {
      _event$.subj.next(payload);
    } else {
      console.error(`Событие ${eventType} не было объявлено в списке событий`);
    }
  }

  parseEvents(_event: Object | string): void {
    if (typeof _event === 'string') {
      this.eventBrocker.push({type: _event, subj: new Subject()});
    } else {
      // @ts-ignore
      Object.keys(_event).forEach((ev: string) => this.parseEvents(_event[ev]));
    }
  }

}

@NgModule()
export class EventChannel {
  public static forRoot(events: Object): ModuleWithProviders<EventChannel> {
    return {
      ngModule: EventChannel,
      providers: [
        EventChannelService,
        {
          provide: 'EVENTS',
          useValue: events,
        },
      ],
    };
  }
}
