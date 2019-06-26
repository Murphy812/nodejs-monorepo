/**
 * Разные универсальный эффекты
 */

import { ModelApiInterface, Modifier } from 'alice-model-engine-api';
import helpers = require('../helpers/model-helper');

/**
 * Эффект, показывающий состояния, вне зависимости от предикатов
 * modifier.conditions = ["cond-id"]
 */

function showAlwaysCondition(api: ModelApiInterface, modifier: Modifier) {
  api.debug('Show always condition ' + JSON.stringify(modifier.conditions));
  if (modifier.conditions) {
    // Пройти по всем совпадаениям в предикатах и показать все состояния
    modifier.conditions.forEach((condition: string) => {
      helpers.addCharacterCondition(api, condition);
    });
  }
}

module.exports = () => {
  return {
    showAlwaysCondition,
  };
};
