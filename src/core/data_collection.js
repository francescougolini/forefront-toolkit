/**
 * Forefront Toolkit - Data Collection
 * 
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as date_utilities from '../utilities/date_utilities.js';

/**
 * A class representing a collection of variables grouped in records.
 */
export class DataCollection {
  constructor(dataModel) {
    if (dataModel) {
      this.variables = {};

      this.variables.list = dataModel;

      this.variables.size = dataModel.length;

      this.variables.maps = {};

      // Declare the indexes to be used to process data.
      this.variables.maps.uids = new Map();
      this.variables.maps.reverseUids = new Map();
      this.variables.maps.index = new Map();
      this.variables.maps.reverseIndex = new Map();
      this.variables.maps.types = new Map();

      // Declare the Maps used to store processed data.
      this.variables.maps.sorting = new Map();
      this.variables.maps.filtering = new Map();
      this.variables.maps.defaultOrder = new Map();

      // The main
      this.dataSet = [];

      // The temporary data set used to store the processed records, e.g. after filtering and/or sorting.
      this.temporaryDataSet = [];
    } else {
      throw 'Data Collection Error: data model NOT found or invalid.';
    }

    // CONSTANTS

    // If it's a string representing a date in the EU format, convert to numeric unix time and order.
    this.euDateTimeRegExp = /\d{1,2}\/\d{1,2}\/\d{4}\s{0,1}:{0,1}\d{0,2}:{0,1}\d{0,2}:{0,1}\d{0,2}/;
  }

  // PROCESSING

  /**
   * Process the data point according to the data model, and ensure that no data point is left undefined/empty.
   *
   * @param {string} dataPoint
   */
  _parseDataPoint(dataPoint = '', variableType = 'text') {
    // Stingify boolean values
    dataPoint = typeof dataPoint === 'boolean' ? dataPoint.toString() : dataPoint;

    if (dataPoint) {
      if (variableType === 'eu_date') {
        dataPoint = String(dataPoint).match(this.euDateTimeRegExp)
          ? dataPoint
          : date_utilities.convertIsoDateInEuDate(dataPoint, 'no-space', true);
      }
    } else {
      switch (variableType) {
        case 'number':
          dataPoint = 0;

          break;

        case 'boolean':
          dataPoint = 'false';

          break;

        default:
          dataPoint = '-';
      }
    }

    return dataPoint;
  }

  /**
   * Create an array of arrays representing the records to be added into the data set.
   *
   * @param {object} rawData An object containing the data to be used to populate the data set.
   */
  _parseRecords(rawData) {
    let records = [];

    if (rawData && rawData.length > 0) {
      for (const dataPoint of rawData) {
        let dataField = [];

        this.variables.maps.uids.forEach((variable, variableUID) => {
          let variableType = this.variables.maps.types.get(variableUID);

          dataField.push(this._parseDataPoint(dataPoint[variable], variableType));
        });

        records.push(dataField);
      }
    }

    return records;
  }

  /**
   * Create an array (data set) of arrays (records) to represent the parsed values (data points).
   *
   * @param {Object} rawData An object containing the data to be used to populate the data set.
   */
  _createDataSet(rawData) {
    const dataPoints = rawData && rawData.length > 0 ? this._parseRecords(rawData) : [];

    this.dataSet = dataPoints;

    // Initially (before it is used to store processed data), the temporary data set mirrors the main data set.
    this.temporaryDataSet = Object.assign([], this.dataSet);
  }

  /**
   * Create the indexes necessary to process, manipulate and represent the data set and it's records.
   */
  _createVariablesMaps() {
    // Generate a Map with the variables according to the order provided in the list of variables.

    for (let i = 0; i < this.variables.size; i++) {
      const variable = this.variables.list[i];
      const index = i;

      const variableUID = variable.uid ? variable.uid : 'var_uid_' + index;

      if (this.variables.list && this.variables.list.includes(variableUID)) {
        throw 'Data Collection Error: ' + variableUID + ' already exists. Please, provide another unique UID.';
      }

      // Generate a unique id for each variable.
      if (variable.sourceField) {
        this.variables.maps.uids.set(variableUID, variable.sourceField);
      } else {
        throw 'Data Collection Error: one or more variable names and/or source fields are missing.';
      }

      // VARIABLES

      // For each variable UID, provide the source field.
      this.variables.maps.reverseUids.set(variable.sourceField, variableUID);

      // For each variable UID, assign a numeric index.
      this.variables.maps.index.set(variableUID, index);

      // For each index, provide the related variable UID.
      this.variables.maps.reverseIndex.set(index, variableUID);

      // The type of each variable UID.
      this.variables.maps.types.set(variableUID, variable.dataType ? variable.dataType : 'text');

      // The default order to display the values by variable UID.
      let rawDefaultOrder = variable.defaultOrder ? variable.defaultOrder : 'none';

      let defaultOrder =
        rawDefaultOrder && ['asc', 'ascending'].includes(rawDefaultOrder)
          ? 'asc'
          : rawDefaultOrder && ['desc', 'descending'].includes(rawDefaultOrder)
          ? 'desc'
          : 'none';

      this.variables.maps.defaultOrder.set(variableUID, defaultOrder);

      // PROCESSING

      // Sorting options for each variable.
      this.variables.maps.sorting.set(variableUID, 'none');

      // Filtering options for each variable.
      this.variables.maps.filtering.set(variableUID, '');
    }
  }

  // DATA MANIPULATION METHODS

  /**
   * Build the data collection.
   *
   * @param {object} rawData An object containing the row data to be used to create the data set.
   */
  buildDataCollection(rawData) {
    // 1. Create the variable index (necessary to get the records). .
    this._createVariablesMaps();

    // 2. Store the records (arrays) into a class property.
    this._createDataSet(rawData);
  }

  /**
   * Return the data points stored in the DataCollection object.
   *
   * @param {string} type Default: 'initial'. Options: 'initial', 'temporary'. The type of the data set.
   * @param {number} firstRecordIndex Default: 0. The index of the first record to be taken from the data set.
   * @param {number} lastRecordIndex Default: last index of selected data. The index of the last record to be retrieved.
   * @param {[string]} variableUIDs Default: []. A list of variables UIDs from which to extract the data.
   */
  getDataPoints(type, firstRecordIndex, lastRecordIndex, variableUIDs) {
    let targetData = [];

    type = type ? type : 'initial';

    if (type == 'initial') {
      targetData = this.dataSet;
    } else if (type == 'temporary') {
      targetData = this.temporaryDataSet;
    }

    let records = [];

    firstRecordIndex = firstRecordIndex !== undefined && firstRecordIndex !== null ? firstRecordIndex : 0;
    lastRecordIndex =
      lastRecordIndex !== undefined && lastRecordIndex !== null
        ? lastRecordIndex
        : targetData
        ? targetData.length - 1
        : 0;

    for (let a = firstRecordIndex; a <= lastRecordIndex; a++) {
      if (variableUIDs) {
        variableUIDs = typeof variableUIDs === 'string' ? [variableUIDs] : variableUIDs;

        let variablesData = [];

        for (const variableUID of variableUIDs) {
          const index = this.variables.maps.index.get(variableUID);

          variablesData.push(targetData[a][index]);
        }

        records.push(variablesData);
      } else {
        records.push(targetData[a]);
      }
    }

    return records;
  }

  /**
   * Clean the existing indexes and add a fresh set of data into the data indexes.
   *
   * @param {object} rawData An object containing the data to be used to populate the data set.
   */
  loadDataSet(rawData) {
    this._resetData();

    if (rawData && rawData.length > 0) {
      // Add the new data and (re-)initialise the data indexes.
      this.buildDataCollection(rawData);
    }
  }

  /**
   * Add additional data to the existing ones on the Table Generator.
   *
   * @param {string} rawData An object containing the data to be used to be added into the data set.
   */
  addRecords(rawData) {
    if (rawData && rawData.length > 0) {
      const data = this._parseRecords(rawData);

      // 2. Include the new parsed records in the data set.
      Array.prototype.push.apply(this.dataSet, data);
    }
  }

  /**
   * Add a new variable to the data set.
   *
   * @param {object} properties The Object representing the variable.
   * @param {[string]} records The array representing the content of the variable. The records are appended sequentially
   * starting from the first data point.
   */
  addVariable(variableProperties, records) {
    this.variables.push(variableProperties);

    this._createVariablesMaps();

    const variableUID = this.variables.maps.reverseUids.get(variableProperties.sourceField);

    if (records && records.length > 0 && variableUID) {
      for (let i = 0; i < this.dataSet.length; i++) {
        this.dataSet[i][variableUID] = dataPoints[i];
      }
    }

    return this.dataSet;
  }

  /**
   * Modify the content of one of more data points given the dataPoint index and/or the variable ID.
   *
   * @param {number} recordIndex (Optional) The dataPoint to be edited or from which to edit the single data set 
   * (identified by the variable).
   * @param {string} variableUID (Optional) The UID of the variable where the data set is located.
   * @param {string || [string]} values Either a string (in case a single dataPoint is to be edited), or a 
   * comma-separated/array of data used to edit many records.
   */
  editDataPoints(recordIndex, variableUID, values) {
    if (recordIndex) {
      const index = this.variables.maps.reverseUids.get(variableUID);

      if (variableUID) {
        const type = this.variables.maps.types.get(variableUID);

        this.dataSet[index] = this._parseDataPoint(values, type);
      } else {
        this.dataSet[index] = this._parseRecords(values);
      }
    } else if (variableUID) {
      const index = this.variables.maps.reverseUids.get(variableUID);

      for (let i = 0; i < this.dataSet.length; i++) {
        if (typeof values == 'string') {
          const splitData = values.split('');

          this.dataSet[i][index] = this._parseDataPoint(splitData[i]);
        } else {
          this.dataSet[i][index] = this._parseDataPoint(values[i]);
        }
      }
    }
  }

  /**
   * Clean the existing indexes.
   *
   * @param {boolean} dataSet Default: true.
   * @param {boolean} variables Default: true.
   */
  removeAllData(dataSet = true, variables = true) {
    // Empty the properties containing the data related to the dataSet.
    if (dataSet) {
      this.dataSet = [];
      this.temporaryDataSet = [];
    }

    // Clear all the Maps associated with the variables of the collection.
    if (variables) {
      this.variables.maps.uids.clear();
      this.variables.maps.reverseUids.clear();

      this.variables.maps.index.clear();
      this.variables.maps.reverseIndex.clear();

      this.variables.maps.types.clear();

      this.variables.maps.sorting.clear();
      this.variables.maps.filtering.clear();

      this.variables.maps.defaultOrder.clear();
    }
  }

  /**
   * Remove all the data points from the dataset.
   *
   * @param {number} firstRecordIndex
   * @param {number} lastRecordIndex
   * @param {[string]} variableUIDs
   */
  removeDataPoints(firstRecordIndex, lastRecordIndex, variableUIDs) {
    lastRecordIndex = lastRecordIndex ? lastRecordIndex : this.dataSet.length - 1;

    const deleteCount = lastRecordIndex - firstRecordIndex;

    if (variableUIDs && variableUIDs.length > 0) {
      variableUIDs = typeof variableUIDs === 'string' ? [variableUIDs] : variableUIDs;

      for (let a = firstRecordIndex; a <= lastRecordIndex; a++) {
        for (const variableUID of variableUIDs) {
          this.editDataPoints(a, variableUID, null);
        }
      }
    }

    this.dataSet.splice(firstRecordIndex, deleteCount);

    // Refactor the temporary data set to match the new data set
    this.temporaryDataSet = this.sortRecords(this.dataSet);

    this.temporaryDataSet = this.filterRecords(this.temporaryDataSet);
  }

  /**
   * Remove a variable and its data points.
   *
   * @param {string} variableUID The UID that represents the data point.
   */
  removeVariable(variableUID) {
    const index = this.variables.maps.index.get(variableUID);

    this.variables.splice(index, 1);

    if (this.dataSet) {
      for (let i = 0; i < this.dataSet.length; i++) {
        this.dataSet.splice(index, 1);
      }
    }

    if (this.temporaryDataSet) {
      for (let i = 0; i < this.temporaryDataSet.length; i++) {
        this.temporaryDataSet.splice(index, 1);
      }
    }
  }

  /**
   * Sort the records according to the DataCollection's sorting map.
   *
   * @param {[string]} records An array of array representing the records to be sorted.
   */
  sortRecords(records) {
    let sortedRecords = Object.assign([], records);

    this.variables.maps.sorting.forEach((ordering, variableUID) => {
      if (ordering != 'none') {
        let variableIndex = variableUID ? this.variables.maps.index.get(variableUID) : -1;

        let order = ordering === 'desc' || ordering === 'descending' ? -1 : 1;

        if (variableUID && variableIndex > -1) {
          sortedRecords.sort((a, b) => {
            let dataPointA = a[variableIndex];
            let dataPointB = b[variableIndex];

            if (dataPointA === undefined || dataPointA === null) {
              dataPointA = '';
            }

            if (dataPointB === undefined || dataPointB === null) {
              dataPointB = '';
            }

            if (String(dataPointA).match(this.euDateTimeRegExp) && String(dataPointB).match(this.euDateTimeRegExp)) {
              dataPointA = Date.parse(date_utilities.convertEuDateInIsoDate(dataPointA));
              dataPointB = Date.parse(date_utilities.convertEuDateInIsoDate(dataPointB));
            }

            // If both values are numeric, do a numeric comparison
            if (
              !isNaN(parseFloat(dataPointA)) &&
              isFinite(dataPointA) &&
              !isNaN(parseFloat(dataPointB)) &&
              isFinite(dataPointB)
            ) {
              // Convert numerical values form string to float.
              dataPointA = parseFloat(dataPointA);
              dataPointB = parseFloat(dataPointB);

              return order * (dataPointA - dataPointB);
            }

            if (dataPointA !== undefined && dataPointB !== undefined) {
              if (dataPointA < dataPointB) {
                return order * -1;
              }

              if (dataPointA > dataPointB) {
                return order * 1;
              }

              return 0;
            }

            return 0;
          });
        } else {
          throw new Error('Error: variable NOT found.');
        }
      }
    });

    return sortedRecords;
  }

  /**
   * Filter records according to the DataCollection's filtering map.
   *
   * @param {[string]} records An array of arrays representing the records to be filtered.
   */
  filterRecords(records) {
    let filteredRecords = Object.assign([], records);

    this.variables.maps.filtering.forEach((value, variableUID) => {
      let variableIndex = variableUID ? this.variables.maps.index.get(variableUID) : -1;

      value = value.toLowerCase();

      filteredRecords = filteredRecords.filter((record) => {
        let dataPoint = record[variableIndex].toString().toLowerCase();

        return dataPoint.includes(value);
      });
    });

    return filteredRecords;
  }
}
