/**
 * Forefront Toolkit - EntrySet
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import { DataProcessor } from '../core/data_processor.js';
import * as formUtilities from '../utilities/form_utilities.js';

/**
 * A set of modular HTML nodes displayed as tabs.
 *
 * @param {Object} properties The properties necessary to instantiate the EntrySet.
 */
export class EntrySet {
  constructor(properties) {
    if (properties && properties.pointOfEntry) {
      // The element in which to insert the data entry.
      this.pointOfEntry = properties.pointOfEntry;

      // Tab Set - Core
      this.module = {};

      const moduleDetails = properties.module && Object.keys(properties.module).length !== 0 ? properties.module : {};

      this.module.id = moduleDetails.id ? moduleDetails.id : 'module-' + Date.now().toString();
      this.module.name = moduleDetails.name ? moduleDetails.name : 'Tab Set';

      // The cluster for the Data Processors.
      const dataCluster =
        moduleDetails.dataCluster && Object.keys(moduleDetails.dataCluster).length !== 0 ? this.module.dataCluster : {};

      this.module.dataCluster.name = dataCluster.attributeName ? dataCluster.attributeName : 'data-ft-cluster';

      // The cluster for the Data Templates.
      this.module.documentCluster = moduleDetails.cluster ? this.module.documentCluster : '';

      this.module.documentCluster.name = documentCluster.attributeName ? documentCluster.attributeName : '';
      this.module.documentCluster.value = documentCluster.attributeValue ? documentCluster.attributeValue : '';

      // Tab Set - Units

      this.module.unit = {};

      // Unit template
      const template = properties.template ? properties.template : '';

      const referenceModelID = template.referenceModel ? template.referenceModel : '';

      const referenceModel = document.querySelector('#' + referenceModelID);

      this.module.unit.model = referenceModel ? referenceModel.innerHTML : '';

      // Initialise a counter of the units to enable their management and action (add, remove, edit).
      this.module.unit.count = 0;
      this.module.unit.last = 0;

      if (this.module.unit.template) {
        // Retrieve custom actions to be applied to each unit.
        this.module.unit.postProcessing = template.postProcessing ? template.postProcessing : null;

        // Create the main module and add it in the DOM.
        const addNewTabButtonID = this.module.id + '-new-tab-button';

        const moduleContainer = `<label for="${this.module.id}">${this.module.name}</label>
                                 <div class="d-flex" id="${this.module.id}">
                                   <nav class="d-flex">
                                     <div class="nav nav-tabs" id="${this.module.id}-tabs"></div>
                                     <div class="ml-auto">
                                       <button class="btn btn-primary" id="${addNewTabButtonID}">
                                         New
                                       </button>
                                     </div>
                                   </nav>
                                   <div id="${this.module.id}-panes"></div>
                                 </div>
                                 <div data-ft-alerts="${this.module.id}"></div>`;

        const container = document.querySelector('#' + this.pointOfEntry);

        container.innerHTML = moduleContainer;

        // Create click listener for the module's "new tab" button.
        const addNewTabButton = document.querySelector('#' + addNewTabButtonID);

        addNewTabButton.addEventListener('click', (event) => {
          this.addUnit();
        });

        // Initialise the Data Processor required to add/update/remove a record.

        const dataProcessing = properties.data && Object.keys(properties.data).length !== 0 ? properties.data : {};

        this.module.data = {};

        this.module.data.getURL = dataProcessing.getURL ? dataProcessing.getURL : '';
        this.module.data.postURL = dataProcessing.postURL ? dataProcessing.postURL : '';
        this.module.data.putURL = dataProcessing.putURL ? dataProcessing.putURL : '';
        this.module.data.deleteURL = dataProcessing.deleteURL ? dataProcessing.deleteURL : '';

        // Token to prevent Cross-Script Request Forgery.
        this.module.data.csrfToken = data.csrfToken ? requests.csrfToken : '';

        // The (Data Processor) Ledger tracks all the data processors created in a module and allows disposing them.
        // Format: {unitNumberX: DataProcessorA, unitNumberY: DataProcessorB, ...}
        this.module.data.ledger = {};
      } else {
        throw 'Tab Set Error: missing template (ref. ' + this.module.name + ').';
      }
    } else {
      throw 'Tab Set Error: invalid or missing properties.';
    }
  }

  /**
   * Create a new unit and enable data processing and (optional) custom actions.
   */
  addUnit() {
    const moduleContainer = document.querySelector('#' + this.modules.container);

    const unitID = this.module.unit.last + 1;

    const unitReference = this.module.id + '-' + unitID;

    // 1. Build the tab.
    const tab = `<a class="nav-item nav-link tab-${this.module.id}" id="tab-${unitReference}" role="tab"
                    href="#pane-${unitReference}" aria-controls="pane-${unitReference}" aria-selected="true">
                        ${unitID}
                 </a>`;

    // 2. Build the pane.
    const paneContentID = 'pane-content-' + unitReference;

    const paneContent = `<div class="pane-content-${this.module.id} 
                            tab-content-pane fade show ${unitID == 1 ? 'active' : ''}" 
                            id="${paneContentID}" role="tabpanel" aria-labelledby="tab-content-${unitReference}">
                                ${this.module.unit.template}
                        </div>`;

    const pane = `<div id="pane-${unitReference}">
                   ${paneContent}
                    <div class="pane-controls-${this.module.id} d-flex" 
                      id="pane-controls-${unitReference}">
                        <div class="mr-auto" data-delete-button="${unitReference}">
                          <button type="button" class="btn btn-primary" data-toggle="button"
                            id="delete-button-${unitReference}" aria-pressed="false">
                              Delete
                          </button>
                        </div>
                        <div data-create-button="${unitReference}">
                          <button type="button" class="btn btn-primary" data-toggle="button"
                            id="create-button-${unitReference}" aria-pressed="false">
                              Create
                          </button>
                        </div>
                        <div data-update-button="${unitReference}">
                          <button type="button" class="btn btn-primary" data-toggle="button"
                            id="update-button-${unitReference}"aria-pressed="false" hidden>
                              Update
                          </button>
                        </div>
                    </div>
                    <div data-ft-alerts="${unitReference}"></div>
                  </div>`;

    // 3. Add unit into the module container.
    moduleContainer.querySelector('#' + this.module.id + '-tabs').insertAdjacentHTML('beforeend', tab);
    moduleContainer.querySelector('#' + this.module.id + '-panes').insertAdjacentHTML('beforeend', pane);

    // Add the Data Cluster attribute and, if provided, add the Document Cluster attribute
    Array.from(
      document.querySelector('#' + paneContentID).querySelectorAll('input, select, checkbox, textarea')
    ).forEach((element, index) => {
      element.setAttribute(this.module.dataCluster.name, unitReference);

      if (this.module.documentCluster.name && this.module.documentCluster.value) {
        element.setAttribute(this.module.documentCluster.name, this.module.documentCluster.value);
      }
    });

    // 4. Add custom processing to the new unit.
    if (this.module.unit.postProcessing && typeof this.module.unit.postProcessing === 'function') {
      return this.module.unit.postProcessing(this.module.id, unitReference);
    } else if (this.module.unit.postProcessing && typeof this.module.unit.postProcessing === 'string') {
      return Function('"use strict";return ' + this.module.unit.postProcessing)()(this.module.id, unitReference);
    }

    // 5. Add Data Processor to enable POST/PUT/DELETE actions.
    const dataProcessorProperties = {
      cluster: {
        name: this.module.name,
        attributeName: this.module.dataCluster.name,
        attributeValue: unitReference,
      },
      data: {
        post: {
          url: this.module.data.postURL,
          button: unitReference,
        },
        put: {
          url: this.module.data.putURL,
          button: unitReference,
        },
        delete: {
          url: this.module.data.deleteURL,
          button: unitReference,
        },
        csrfToken: csrfToken,
      },
      alert: unitReference,
    };

    // Add the unit's Data Processor to the module Data Processor Ledger.
    this.module.ledger[unitReference] = new DataProcessor(dataProcessorProperties);

    // Enable buttons actions.
    unitDataProcessors.onButtonClick('POST', false);
    unitDataProcessors.onButtonClick('PUT', false);
    unitDataProcessors.onButtonClick('DELETE', false, (unitReference) => this.removeUnitID(unitReference));

    // 6. Increment the count of units the index of last record one by one.
    this.module.unit.count = this.module.unit.count + 1;
    this.module.unit.last = this.module.unit.last + 1;
  }

  /**
   * Get the data, build the units, and add them in the data processor.
   */
  getUnits() {
    // Function to build the unit and populate it with data.
    let createUnits = (units) => {
      for (const unit of units) {
        // 1. Create an empty unit

        this.addUnit();

        const unitID = this.module.unit.last + 1;
        const unitReference = this.module.id + '-' + unitID;

        // 2. Populate the unit's pane

        formUtilities.setFormDataByCluster(unitReference, unit, this.dataCluster.attributeValue);

        // 3. Update counters
        this.module.unit.count = this.module.unit.count + 1;
        this.module.unit.last = this.module.unit.last + 1;
      }
    };

    const dataProcessorProperties = {
      cluster: {
        name: this.module.name,
        attributeName: this.module.dataCluster.name,
        attributeValue: this.module.dataCluster.value,
      },
      data: {
        get: {
          url: this.module.data.getURL,
          multi: true,
        },
        csrfToken: csrfToken,
        postProcessing: (data) => {
          createUnits(data);
        },
      },
      alert: this.module.id,
    };

    const unitsRetrievalDataProcessor = new DataProcessor(dataProcessorProperties);

    unitsRetrievalDataProcessor.processRequest('GET', false);
  }

  /**
   * Remove a unit and disable data processing and (optional) custom actions.
   *
   * @param {string} unitReference The DOM id of the unit to be disposed.
   */
  removeUnit(unitReference) {
    // Remove the data processor of the unit.
    this.module.ledger[unitReference] = null;

    // Remove the unit from the Data Processor Ledger.
    delete this.module.ledger[unitReference];

    // Remove the unit from the DOM.
    const tab = document.querySelector('#' + 'tab-' + unitReference);
    const pane = document.querySelector('#' + 'pane-' + unitReference);

    if (tab) {
      tab.remove();
    }

    if (pane) {
      pane.remove();
    }

    // Remove the unit from the global count.
    this.module.unit.count = this.module.unit.count - 1;
  }
}
