# EventChannel for Angular services

Event channel for communicate Angular services

## Build

Run `ng build event-channel` to build the project. The build artifacts will be stored in the `dist/` directory.

## Import

```
import { EventChannel } from 'event-channel';

export const EVENTS = {
 LOGIN = 'ACCOUNT.LOGIN',
 LOGOFF = 'ACCOUNT.LOGOFF'
};

@NgModule({
 imports: [
  EventChannel.forRoot(EVENTS)
 ]
})
```

## Using in services

```
import { EventChannelService } from 'event-channel';
import { EVENTS } from './app.module';

@Injectable({
 providedIn: 'root'
})
export class AnyService {
 constructor(private eventChannel: EventChannelService) {
  this.eventChannel.on(EVENTS.LOGIN).subscribe(() => /*HANDLE EVENT*/);
 }
})
```
