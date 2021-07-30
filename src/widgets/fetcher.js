/**
 * Forefront Toolkit - Fetcher
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import { Table } from './table.js';
import { FilterSet } from './filterSet.js';

/**
 * A Fetcher allows to the data processing and the UI orchestration of a Table and a FilterSet.
 *
 * @param {Object} properties The properties necessary to instantiate the Fetcher.
 */
export class Fetcher {
  constructor(properties) {
    this.id = 'toolbox-' + Date.now();

    if (properties && properties.pointOfEntry) {
      // The element in which to insert the toolbox.
      this.pointOfEntry = properties.pointOfEntry;

      // Pagination
      // NOTE: this is a API-dependent feature. Multiple fields might be required.
      const pagination =
        properties.pagination && Object.keys(properties.pagination).length > 0 ? properties.pagination : null;

      this.pagination = {};

      this.pagination.enabled = pagination ? true : false;

      // If the REST API requires a page field.
      this.pagination.pageField = pagination && pagination.pageField ? pagination.pageField : undefined;

      // If the REST API requires a field with the number of records to load.
      this.pagination.batchField = pagination && pagination.batchField ? pagination.batchField : undefined;

      // If the REST API requires a start and end record query field.
      this.pagination.startField = pagination && pagination.startField ? pagination.startField : undefined;

      this.pagination.endField = pagination && pagination.endField ? pagination.endField : undefined;

      // The number of records to be loaded
      this.pagination.batch =
        pagination && pagination.batch && !isNaN(pagination.batch) ? parseInt(pagination.batch) : undefined;

      // A map with the recovered results for pagination.
      this.pagination.dataMap = new Map();

      // Data Requests
      this.requests = {};
      this.requests.http = {};

      const httpRequest =
        properties.httpRequest && Object(properties.httpRequest).length !== 0 ? properties.httpRequest : {};

      this.requests.http.get = httpRequest.getURL ? httpRequest.getURL : '';

      this.requests.csrfToken = properties.httpRequest.csrfToken ? properties.httpRequest.csrfToken : '';

      // If true, run the default query at startup.
      this.requests.runAtStartup =
        properties.httpRequest.runAtStartup && properties.httpRequest.runAtStartup === true ? true : false;

      // TODO: evaluate if it's still necessary
      this.triggerChange = properties.triggerChange ? properties.triggerChange : false;

      // CUSTOM PRE/POST-PROCESS FUNCTIONS

      // Rreplace the list generator backend. To be used when the list generator has a dataset NOT generated normally.
      this.customBackend = properties.customBackend ? properties.customBackend : null;

      // Custom function to operates changes after the standard table is constructed.
      this.customDataProcessing = properties.customProcessing ? properties.customProcessing : null;

      // Status snippet
      this.statusSnippet = properties.statusSnippet ? properties.statusSnippet : false;

      // Table
      this.table = properties.table ? new Table(properties.table) : null;

      // FilterSet
      this.filterSet = properties.filterSet ? new FilterSet(properties.filterSet) : null;

      // Declare and initialise a global variable to store the fetcher controls.
      this.controls = {};
    } else {
      throw 'Fetcher Error: manifest NOT found.';
    }
  }

  /**
   * Get the data, populate the table, and provide a status update.
   *
   * @param {boolean} newQuery Clean the page index and start the data retrieval from scratch.
   */
  _getData(newQuery = true) {
    // Disable the button while the request is processed.
    if (this.pagination.enabled) {
      this._enableMoreRecordsButton(false);
    }

    if (newQuery && this.table) {
      // Empty the data collections, but keep the data model.
      this.table.data.removeAllData(true, false);
      // Empty the pagination map.
      this.pagination.dataMap = new Map();
    }

    // If a table is provided, run the data retrieval and populate its body.
    if (this.table) {
      let query = '';

      if (this.filterSet) {
        query = this.filterSet.getSearchQuery();
      }

      // If exists, add pagination.
      query += (query ? '&' : '') + this._createPaginationQuery();

      if (this.requests.http.get && !this.customBackend) {
        let url = this.requests.http.get + (query ? '?' + query : '');

        if (this.statusSnippet) {
          // Set a "loading..." message to prepare for the AJAX call
          this._setStatusSnippet('partial', 'Loading...', true);
        }

        fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-CSRFToken': this.requests.csrfToken,
          },
        })
          .then((response) => {
            if (!response.ok) {
              if (this.statusSnippet) {
                // Set an "error" message to prepare for the AJAX call
                this._setStatusSnippet('partial', 'Error', true);
              }

              alert('Error: ' + response.statusText);
            } else {
              if (this.statusSnippet) {
                // Set a "loading..." message to prepare for the AJAX call
                this._setStatusSnippet('partial', 'Loading...');
              }
            }

            return response.json();
          })
          .then((data) => {
            if (data) {
              const customProcessingType = typeof this.customDataProcessing;

              if (customProcessingType === 'function' || customProcessingType === 'string') {
                let dataProcessing = Promise.resolve();

                if (customProcessingType === 'function') {
                  dataProcessing = new Promise((data) => {
                    return this.customDataProcessing(data);
                  });
                } else if (customProcessingType === 'string') {
                  dataProcessing = new Promise((data) => {
                    return Function('"use strict";return ' + this.customDataProcessing)()(data);
                  });
                }

                dataProcessing.then((data) => {
                  this._buildPage(data);
                });
              } else {
                this._buildPage(data);
              }

              if (data.length > 0) {
                if (this.pagination.dataMap.size < 1) {
                  // First page
                  this.table.createTable(data);
                } else {
                  // Pages after the first one
                  this.table.data.addRecords(data);

                  // Combine the new data with the existing one.
                  this.table.data.temporaryDataSet.concat(data);

                  // Refresh table
                  this.table.refreshTable();
                }

                // Re-enable the "more records" button is enabled to allow for another retrieval attempt.
                if (this.pagination.enabled) {
                  this._enableMoreRecordsButton(true);
                }
              } else {
                // Refresh table
                this.table.refreshTable();

                // Disable the "more records" button.
                if (this.pagination.enabled) {
                  this._enableMoreRecordsButton(false);
                }
              }

              if (this.triggerChange) {
                this.table.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          })
          .catch((error) => {
            if (this.statusSnippet) {
              // Set a "loading..." message to prepare for the AJAX call
              let errorMessage = 'error';

              this._setStatusSnippet('partial', errorMessage, true);
            }

            alert(error);
          });
      } else if (typeof this.customBackend == 'function') {
        this.customBackend(query);
      }
    }
  }

  _createRecordSet() {
    // Table
    if (this.table) {
      // Create an empty table.
      this.table.createTable();
    }

    // FilterSet
    if (this.filterSet) {
      this.filterSet.initialise();

      // Add the search button "on click" event listener.
      const filterSetSearchButton = this.filterSet.getSearchButton();

      if (filterSetSearchButton) {
        filterSetSearchButton.addEventListener('click', (event) => {
          this._getData();
        });
      }

      // Trigger a resize event if the filterSet change, in order to resize sticky/viewport modes.
      if (this.table && this.table.mode !== 'standard') {
        const filterSet = document.querySelector('#' + this.filterSet.id);

        const config = { attributes: true, childList: true, subtree: true };

        const callback = (mutationsList, observer) => {
          document.body.dispatchEvent(new Event('resize', { bubbles: true }));
        };

        const observer = new MutationObserver(callback);

        observer.observe(filterSet, config);
      }
    }
  }

  /**
   * Add the controls required to run actions, and provide information on the records processed.
   */
  _addControls() {
    const leftControls = document.querySelector('#' + this.id + '-controls-left');
    const rightControls = document.querySelector('#' + this.id + '-controls-right');

    // Fetcher controls
    if (this.pagination.enabled) {
      // More records button
      const moreRecordsButton = `<button type="button" class="btn btn-outline-secondary btn-sm mx-1" 
                                  id="${this.id} + '-more-records">
                                    <i class="bi bi-view-list" role="img" aria-hidden="true"></i>
                                    More Records
                                  </button>`;

      const moreRecordsButtonContainer = document.createElement('div');
      moreRecordsButtonContainer.innerHTML = moreRecordsButton;

      this.controls.moreRecords = moreRecordsButtonContainer.querySelector('button');
      this.controls.moreRecords.addEventListener('click', (event) => {
        // Retrieve data and add them into the table.
        this._getData(false);

        // By triggering the scroll event, the table's header will be resized to fit the new content.
        const tableBody = document.querySelector('#' + this.table.id + '-body');
        tableBody.parentElement.dispatchEvent(new Event('scroll', { bubbles: true }));
      });

      leftControls.insertAdjacentElement('afterbegin', this.controls.moreRecords);
    }

    // Table controls and status updates.
    if (this.table) {
      // Export button (from Table)
      rightControls.insertAdjacentElement('afterbegin', this.table.controls.export);
      // Reset Button (from Table)
      rightControls.insertAdjacentElement('afterbegin', this.table.controls.reset);

      // Update the status snippet with the number of records every time changes are observed in the table.
      const tablePointOfEntry = document.querySelector('#' + this.table.pointOfEntry);

      const config = { childList: true, subtree: true };

      const callback = (mutationsList, observer) => {
        this._setStatusSnippet('partial', this.table.data.temporaryDataSet.length);

        this._setStatusSnippet('total', this.table.data.dataSet.length);
      };

      const observer = new MutationObserver(callback);
      observer.observe(tablePointOfEntry, config);
    }
  }

  /**
   * Create a container with the buttons required to perform additional actions on data and data-related elements,
   * such as reset and export.
   */
  _createContainer() {
    // If a container for controls and status snippets doesn't exist, create one.
    const leftControls = `<div id="${this.id}-controls-left" class="col text-start"></div>`;

    const statusSnippet = `<div id="${this.id}-status-snippet" class="status-snippet col-auto text-center">
                              <span id="${this.id}-partial-records" class="partial-records small text-secondary"></span>
                              <span id="${this.id}-total-records" class="total-records small text-secondary"></span>
                            </div>`;

    const rightControls = `<div id="${this.id}-controls-right" class="col text-end"></div>`;

    const controlsContainer = `<div id="${this.id}" class="row my-3">
                                  ${leftControls}
                                  ${statusSnippet}
                                  ${rightControls}
                                </div>`;

    // Replace the element referenced by the point of empty with the control container.
    const container = document.querySelector('#' + this.pointOfEntry);
    container.innerHTML = controlsContainer;

    // Include the controls
    this._addControls();
  }

  /**
   * Show results according to the batch size.
   *
   * @param {[string]} data An array of arrays representing the batch to be displayed.
   */
  _buildPage(data) {
    let page = [];

    data.forEach((row, index) => {
      page.push(data[row]);
    });

    // A map with the recovered results.
    this.pagination.dataMap.set(this.pagination.dataMap.size + 1, page);
  }

  /**
   * Create the part of the query related to the pagination.
   *
   * @returns A string with the pagination query, e.g. 'page=1&limit=2".
   */
  _createPaginationQuery() {
    // Build the query by creating separate blocks, to be joined at the end of the function.
    let queries = [];

    if (this.pagination.enabled) {
      // Pagination: Page field
      if (this.pagination.pageField) {
        // Increment the zero-based index to one to get a one-based indexing.
        queries.push(this.pagination.pageField + '=' + (this.pagination.dataMap.size + 1));
      }

      // Pagination: Batch field - The following fields depend on the explicit specification of the batch value.
      if (this.pagination.batch && this.pagination.batchField) {
        queries.push(this.pagination.batchField + '=' + this.pagination.batch);
      }

      // Pagination: Start field and/or End field
      if (this.pagination.startField || this.pagination.endField) {
        const loadedRecords = this.pagination.batch * (this.pagination.dataMap.size + 1);

        if (this.pagination.startField) {
          queries.push(this.pagination.startField + '=' + (loadedRecords + 1));
        }

        // End field
        if (this.pagination.endField) {
          queries.push(this.pagination.endField + '=' + (loadedRecords + this.pagination.batch + 1));
        }
      }
    }

    return queries.join('&');
  }

  /**
   * A method to enable or disable the "more records" button.
   *
   * @param {boolean} enable If true, enable the button, other disable it.
   */
  _enableMoreRecordsButton(enable = true) {
    // Show the button.
    this.controls.moreRecords.hidden = false;

    if (enable) {
      // Enable the button
      this.controls.moreRecords.disabled = false;
    } else {
      // Disable the button
      this.controls.moreRecords.disabled = true;
    }
  }

  /**
   * Function to generate and append the status/records counter snippet
   *
   * @param {string} type Options: 'partial', 'total'.
   * @param {string} value The value to be shown in the status snippet.
   * @param {boolean} hideTotal Default: false. .
   */
  _setStatusSnippet(type, value = '', hideTotal = false) {
    const partialRecords = document.querySelector('#' + this.id + '-partial-records');
    const totalRecords = document.querySelector('#' + this.id + '-total-records');

    if (type === 'partial') {
      partialRecords.innerHTML = value;
      partialRecords.hidden = false;

      if (hideTotal) {
        totalRecords.hidden = true;
      }
    } else if (type === 'total') {
      totalRecords.innerHTML = ' of ' + value;
      totalRecords.hidden = false;
    }
  }

  /**
   * Create a list with filters and custom behaviour.
   */
  initialise() {
    // Create the Fetcher
    this._createRecordSet();

    // Create the HTML of the container used to include the controls and the status snippet (if enabled).
    this._createContainer();

    // If so defined, retrieve the data from the default query, i.e. the one defined in the Fetcher properties.
    if (this.requests.runAtStartup) {
      this._getData();
    }
  }
}
