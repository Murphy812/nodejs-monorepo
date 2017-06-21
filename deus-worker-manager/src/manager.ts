import { Nano, NanoDatabase } from 'nano';
import nano = require('nano');

import { Config } from './config';
import EventsSource, { Event } from './events_source';
import ModelStorage from './model_storage';
import EventStorage from './event_storage';
import WorkersPool from './workers_pool';
import Logger from './logger';
import Worker, { EngineResult } from './worker';

type SyncedModels = {
    [characterId: string]: Event
};

export default class Manager {
    private nano: Nano;
    private eventsSource: EventsSource;
    private modelStorage: ModelStorage;
    private workingModelStorage: ModelStorage;
    private viewModelStorage: ModelStorage;
    private eventStorage: EventStorage;
    private pool: WorkersPool;
    private logger: Logger;
    private syncedModels: SyncedModels = {};

    constructor(private config: Config) {
        this.nano = nano(config.db.url);
        this.eventsSource = new EventsSource(this.nano, config.db.events);

        this.logger = new Logger(this.config);
        this.modelStorage = new ModelStorage(this.nano.use(config.db.models));
        this.workingModelStorage = new ModelStorage(this.nano.use(config.db.workingModels));
        this.viewModelStorage = new ModelStorage(this.nano.use(config.db.viewModels));
        this.eventStorage = new EventStorage(this.nano.use(config.db.events));
        this.pool = new WorkersPool(this.logger, config.pool.workerModule, config.pool.workerArgs, config.pool.options);

        this.eventsSource.refreshModelEvents.subscribe(this.refreshModel);
        this.eventsSource.follow();
    }

    refreshModel = async (event: Event) => {
        this.logger.info('manager', 'refresh event for %s', event.characterId, event);

        const characterId = event.characterId;

        if (!this.syncedModels[characterId]) {
            this.syncedModels[characterId] = event;
            await this.pool.withWorker(this.processModel(characterId));
            delete this.syncedModels[characterId]
        } else {
            this.syncedModels[characterId] = event;
        }
    }

    processModel(characterId: string) {
        this.logger.debug('manager', 'process model %s', characterId);

        return async (worker: Worker) => {
            const syncEvent = this.syncedModels[characterId];
            if (!syncEvent) {
                this.logger.warn('manager', 'Sync event lost', { characterId })
                return;
            }

            const model = await this.modelStorage.find(characterId);

            const events = (await this.eventStorage.range(characterId, model.timestamp + 1, syncEvent.timestamp))
                .filter((event: Event) => event.eventType != '_NoOp');

            this.logger.debug('manager', 'events = %j', events);

            const result: EngineResult = await worker.process(syncEvent, model, events);

            this.logger.debug('manager', 'result = %j', result);

            let { baseModel, workingModel, viewModel } = result;
            delete workingModel._rev;
            delete viewModel._rev;

            await Promise.all([
                this.modelStorage.store(baseModel),
                this.workingModelStorage.store(workingModel),
                this.viewModelStorage.store(viewModel)
            ]);
        }
    }
}
