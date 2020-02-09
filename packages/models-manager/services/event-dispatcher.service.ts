import { inject, Provider } from '@loopback/core';
import { Event, EventForModelType, EmptyModel } from '@sr2020/interface/models/alice-model-engine';
import { Location } from '@sr2020/interface/models/location.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { ModelProcessResponse } from '@sr2020/interface/models/process-requests-respose';
import { ModelEngineService, processAny } from '@sr2020/interface/services';
import { AquiredModelsStorage } from '../utils/aquired-models-storage';

export interface EventDispatcherService {
  dispatchEventsRecursively(events: EventForModelType[], aquiredModels: AquiredModelsStorage): Promise<ModelProcessResponse<EmptyModel>[]>;

  dispatchEventForModelType(event: EventForModelType, aquiredModels: AquiredModelsStorage): Promise<ModelProcessResponse<EmptyModel>>;

  dispatchEvent<TModel extends EmptyModel>(
    tmodel: new () => TModel,
    event: Event,
    aquiredModels: AquiredModelsStorage,
  ): Promise<ModelProcessResponse<TModel>>;
}

export class EventDispatcherServiceImpl implements EventDispatcherService {
  constructor(private _modelEngineService: ModelEngineService, private _knownModelTypes: (new () => any)[]) {}

  async dispatchEventsRecursively(
    events: EventForModelType[],
    aquiredModels: AquiredModelsStorage,
  ): Promise<ModelProcessResponse<EmptyModel>[]> {
    const result: ModelProcessResponse<EmptyModel>[] = [];
    while (events.length) {
      const promises = events.map((outboundEvent) => this.dispatchEventForModelType(outboundEvent, aquiredModels));
      const outboundEventResults = await Promise.all<ModelProcessResponse<EmptyModel>>(promises);
      result.unshift(...outboundEventResults);
      events = [];
      for (const r of outboundEventResults) {
        events.unshift(...r.outboundEvents);
      }
    }
    return result;
  }

  async dispatchEventForModelType(event: EventForModelType, aquiredModels: AquiredModelsStorage) {
    const modelType = this._knownModelTypes.find((t) => t.name == event.modelType);
    if (!modelType) {
      throw new Error('Unsupported modelType: ' + event.modelType);
    }

    const result = await this.dispatchEvent(modelType, event, aquiredModels);
    return result;
  }

  async dispatchEvent<TModel extends EmptyModel>(tmodel: new () => TModel, event: Event, aquiredModels: AquiredModelsStorage) {
    const baseModel: TModel = await aquiredModels.lockAndGetBaseModel(tmodel, Number(event.modelId));
    event.timestamp = Math.max(event.timestamp, baseModel.timestamp);
    const result = await processAny(tmodel, this._modelEngineService, {
      baseModel,
      events: [event],
      timestamp: event.timestamp,
      aquiredObjects: aquiredModels.getWorkModels(),
    });
    await aquiredModels.setModel(tmodel, result.baseModel, result.workModel);
    return result;
  }
}

export class EventDispatcherServiceProvider implements Provider<EventDispatcherService> {
  constructor(
    @inject('services.ModelEngineService')
    private _modelEngineService: ModelEngineService,
  ) {}

  value(): EventDispatcherService {
    return new EventDispatcherServiceImpl(this._modelEngineService, [Sr2020Character, Location, QrCode]);
  }
}
