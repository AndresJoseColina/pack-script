import SyncReader from '../readers/sync';
import Settings from '../settings';
import { Entry } from '../types';
export default class SyncProvider {
    private readonly _root;
    private readonly _settings;
    protected readonly _reader: SyncReader;
    constructor(_root: string, _settings: Settings);
    read(): Entry[];
}
//# sourceMappingURL=sync.d.ts.map