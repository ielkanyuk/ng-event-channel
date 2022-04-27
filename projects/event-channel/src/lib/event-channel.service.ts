import {Inject, Injectable} from '@angular/core';
import {Subject, Observable, EMPTY} from 'rxjs';
import {HubConnection, HubConnectionBuilder, IHttpConnectionOptions, LogLevel} from '@microsoft/signalr';

interface ServiceEvent {
  type: string;
  subj: Subject<any>;
}

export interface EventChannelConfig {
  listenServerEvents: boolean;
}

/**
 * EventChannel для коммуникации сервисов
 */
@Injectable({
  providedIn: 'root',
})
export class EventChannelService {
  private eventBrocker: ServiceEvent[] = [];
  private connection?: HubConnection;

  constructor(
    @Inject('EVENTS') private events: Object,
    @Inject('config') private config: EventChannelConfig = {listenServerEvents: false},
  ) {
    this.parseEvents(events);
  }

  on<T>(eventType: string): Observable<T> {
    const _event$ = this.eventBrocker.find(event => event.type === eventType);

    if (_event$) {
      return _event$.subj.asObservable();
    }

    console.error(`Подписка на несуществующее событие ${eventType}`);
    return EMPTY;
  }

  dispatch<T>(eventType: string, payload?: T): void {
    const _event$ = this.eventBrocker.find(ev => ev.type === eventType);

    if (_event$) {
      _event$.subj.next(payload);
    } else {
      console.error(`Событие ${eventType} не было объявлено в списке событий`);
    }
  }

  private parseEvents(_event: Object | string): void {
    if (typeof _event === 'string') {
      const subj = new Subject();
      this.eventBrocker.push({type: _event, subj});

      if (this.config.listenServerEvents) {
        const on = () => this.connection!.on(_event, v => subj.next(JSON.parse(v)));

        if (!this.connection) {
          this.startListenServerEvents().then(on);
        } else {
          on();
        }
      }

    } else {
      Object.keys(_event).forEach((ev: string) => this.parseEvents(_event[ev]));
    }
  }

  private async startListenServerEvents(): Promise<void> {
    const options: IHttpConnectionOptions = {transport: 1, logger: LogLevel.None};
    this.connection = new HubConnectionBuilder().withUrl('/api/signalr-service/ws', options).withAutomaticReconnect().build();

    try {
      await this.connection.start();
    } catch {
      setTimeout(() => this.startListenServerEvents(), 5000);
    }
  }

  public stopListenServerEvents(): void {
    if (this.connection) this.connection.stop().then(() => this.connection = undefined);
  }
}
