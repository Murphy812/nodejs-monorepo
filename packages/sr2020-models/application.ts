import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import * as path from 'path';
import { Engine } from '@sr2020/alice-model-engine/engine';
import { loadModels, requireDir } from '@sr2020/alice-model-engine/utils';
import { Config } from '@sr2020/alice-model-engine/config';

export class SR2020ModelsApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, 'static'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.bind(Engine.bindingKey + '.Sr2020Character').to(
      new Engine(loadModels('./scripts/character'), Config.parse(requireDir('./scripts/character/catalogs'))),
    );
    this.bind(Engine.bindingKey + '.Location').to(
      new Engine(loadModels('./scripts/location'), Config.parse(requireDir('./scripts/location/catalogs'))),
    );

    this.projectRoot = __dirname + '/../';
    const dirs = ['sr2020-models'];
    // Customize @loopback/boot Booter Conventions here
    const extension = require.extensions['.ts'] ? 'ts' : 'js';
    this.bootOptions = {
      controllers: {
        dirs,
        extensions: [`.controller.${extension}`],
      },
      datasources: {
        dirs,
        extensions: [`.datasource.${extension}`],
      },
      repositories: {
        dirs,
        extensions: [`.repository.${extension}`],
      },
      services: {
        dirs,
        extensions: [`.service.${extension}`],
      },
    };
  }
}
