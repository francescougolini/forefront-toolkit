/**
 * Forefront Toolkit - Data Processor
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as utilities from '../utilities/generic_utilities.js';
import * as formUtilities from '../utilities/form_utilities.js';

// Global variable to store (if enabled) the cached data for the specified cluster.
var dataCache = [];

/**
 * A class that represent a data processor to be used to process data and transmit data.
 * 
 * @param {Object} properties An object containing the information require to generate a data processor.
 */
export class DataProcessor {
  constructor(properties) {
    if (properties) {
      this.data = {};

      this.data.get = {};
      this.data.get.dom = {};

      this.data.post = {};
      this.data.post.response = {};
      this.data.post.response.pk = {};

      this.data.put = {};

      this.cluster = {};
      this.cluster.attribute = {};

      // Data Cluster Info
      const cluster = properties.cluster && Object.keys(properties.cluster).length !== 0 ? properties.cluster : {};

      this.cluster.name = cluster.name ? cluster.name : 'Data Cluster';
      this.cluster.attribute.name = cluster.attributeName ? cluster.attributeName : 'data-ft-cluster';
      this.cluster.attribute.value = cluster.attributeValue ? cluster.attributeValue : '';

      // Data Processing Properties
      const data = properties.data && Object.keys(properties.data).length !== 0 ? properties.data : {};

      // Get Data
      const getData = data.get && Object.keys(data.get).length !== 0 ? data.get : {};

      // HTTP data
      this.data.get.url = getData.url ? getData.url : '';

      // DOM data ("data-"" attribute)
      const getDomData = getData.dom && Object.keys(getData.dom).length !== 0 ? getData.dom : {};

      this.data.get.dom.containerID = getDomData.containerID ? getDomData.containerID : '';
      this.data.get.dom.attributeName = getDomData.attributeName ? getDomData.attributeName : '';
      this.data.get.dom.key = getDomData.key ? getDomData.key : '';

      // Multi-record GET: if true, fetched data are not processed.
      this.data.get.multi = getData.multi === true ? true : false;

      // POST data
      const postData = data.post && Object.keys(data.post).length !== 0 ? data.post : {};

      this.data.post.url = postData.url ? postData.url : '';
      this.data.post.button = postData.button ? postData.button : '';

      const postButtonContainers = document.querySelectorAll('[data-create-button="' + this.data.post.button + '"]');

      Array.from(postButtonContainers).forEach((buttonContainer, index) => {
        buttonContainer.innerHTML(`
            <button type="button" class="btn btn-success btn-lg btn-block" 
              name="button-create-${this.cluster.attribute.value}" style="default" 
              id="button-create-${this.cluster.attribute.value}">Create ${this.cluster.attribute.name}</button>  
          `);
      });

      const response = postData.response && Object.keys(postData.response).length !== 0 ? postData.response : {};

      this.data.post.response.url = response.urlPath ? response.urlPath : '';
      this.data.post.response.uid.fieldName = response.uidFieldName ? response.uidFieldName : '';
      this.data.post.response.uid.value = response.uidValue ? response.uidValue : '';

      // PUT data
      const putData = data.put && Object.keys(data.put).length !== 0 ? data.put : {};

      this.data.put.url = putData.url ? putData.url : '';
      this.data.put.button = putData.button ? putData.button : '';

      const putButtonContainers = document.querySelectorAll('[data-update-button="' + this.data.post.button + '"]');

      Array.from(putButtonContainers).forEach((buttonContainer, index) => {
        buttonContainer.innerHTML(`
            <button type="button" class="btn btn-success btn-lg btn-block" 
              name="button-update-${this.cluster.attribute.value}" style="default" 
              id="button-update-${this.cluster.attribute.value}">Update ${this.cluster.attribute.name}</button>      
          `);
      });

      // DELETE data
      const deleteData = data.delete && Object.keys(data.delete).length !== 0 ? data.delete : {};

      this.data.delete.url = deleteData.url ? deleteData.url : '';
      this.data.delete.button = deleteData.button ? deleteData.button : '';

      const deleteButtonContainers = document.querySelectorAll('[data-delete-button="' + this.data.post.button + '"]');

      Array.from(deleteButtonContainers).forEach((buttonContainer, index) => {
        buttonContainer.innerHTML(`
            <button type="button" class="btn btn-danger btn-lg btn-block" 
              name="button-delete-${this.cluster.attribute.value}" style="default" 
              id="button-delete-${this.cluster.attribute.value}">Delete ${this.cluster.attribute.name}</button>
          `);
      });

      // Token to prevent Cross-Script Request Forgery.
      this.data.csrfToken = data.csrfToken ? requests.csrfToken : '';

      // Store data into a global variable.
      this.data.cache = data.cache ? data.cache : false;

      // Pre/Post-process data
      this.data.preProcessing = data.preProcessing ? data.preProcessing : null;
      this.data.postProcessing = data.postProcessing ? data.postProcessing : null;

      // Alerts

      this.alerts = properties.alerts ? properties.alerts : '';

      if (this.alerts) {
        formUtilities.createAlertsModule(this.alerts, true, true, true, true);
      }

      const statusSnippetReference = properties.statusSnippet ? properties.statusSnippet : '';

      this.statusSnippet = document.querySelectorAll('[data-ft-status-snippet="' + statusSnippetReference + '"]');

      this.redirect = properties.redirect ? properties.redirect : null;
    } else {
      throw 'Data Processor Error: invalid or missing properties.';
    }
  }

  // Return a JSON object with the element required to create and update the data of the cluster.
  #parseData() {
    // Harvest the DOM for the data associated with the cluster.
    const data = formUtilities.getFormData(this.cluster.attribute.name, this.cluster.attribute.value);

    if (this.data.preProcessing && typeof this.data.preProcessing === 'function') {
      this.data.preProcessing(data);
    } else if (this.data.preProcessing && typeof this.data.preProcessing === 'string') {
      Function('"use strict";return ' + this.data.preProcessing)()(data);
    }

    const jsonData = JSON.stringify(data);

    return jsonData;
  }

  /**
   * Save, update or get record/s.
   *
   * @param {string} requestType Values: 'GET_DOM_DATA' / 'GET' / 'POST' / 'PUT'
   * @param {boolean} redirect (Optional) If true, redirect to the address specified in the Data Processor properties.
   */
  processRequest(requestType, redirect) {
    // If it's a GET_DOM_DATA request, fill the DOM with the elements provided in the data request
    if (requestType == 'GET_DOM_DATA') {
      const postProcessing = (data) => {
        if (this.data.get.multi !== true) {
          formUtilities.setFormDataByCluster(this.cluster.attribute.value, data);
        }

        if (this.data.postProcessing && typeof this.data.postProcessing === 'function') {
          this.data.postProcessing(data);
        } else if (this.data.postProcessing && typeof this.data.postProcessing === 'string') {
          Function('"use strict";return ' + this.data.postProcessing)()(data);
        } else if (this.data.get.multi === true) {
          throw 'Data Processor Error: postProcessing is required to access the requested data. Check GET properties.';
        }
      };

      if (this.data.get.dom.key) {
        // If the data in the DOM "data-" attribute is encoded, decode it, get the data and post-process them.
        utilities.getEncodedData(
          this.get.dom.containerID,
          this.data.get.dom.attributeName,
          this.data.get.dom.key,
          postProcessing
        );
      } else {
        // If the data in the DOM "data-" attribute is NOT encoded, just get the data and post-process them.
        utilities.getData(this.get.dom.containerID, this.data.get.dom.attributeName, postProcessing);
      }
    } else {
      // Define the rest URL according to the type of request.
      var url = '';
      var data = {};
      var actionMessage = '';
      var statusMessage = '';
      switch (requestType) {
        case 'GET':
          url = this.data.get.url + this.data.post.response.uid.value;

          data = null;

          actionMessage = 'Loading';

          break;

        case 'POST':
          url = this.data.post.url;

          data = this.#parseData();

          actionMessage = 'Saving';
          statusMessage = 'saved';

          break;

        case 'PUT':
          url = this.data.put.url + this.data.post.response.uid.value + '/';

          data = this.#parseData();

          actionMessage = 'Updating';
          statusMessage = 'updated';

          break;

        case 'DELETE':
          url = this.data.delete.url + this.data.post.response.uid.value + '/';

          data = this.#parseData();

          actionMessage = 'Deleting';
          statusMessage = 'deleted';

          break;
      }

      // Optional feature -- If enabled, show in the status snippet the loading message
      if (this.statusSnippet && this.statusSnippet.length > 0) {
        Array.from(this.statusSnippet).forEach((snippet, index) => {
          snippet.innerHTML = actionMessage + ' ' + this.cluster.name + '...';
        });
      }

      // Optional feature -- If enabled, show a "processing..." alert.
      if (this.alerts) {
        formUtilities.showSubmissionStatusAlert(
          'progress',
          this.cluster.attribute.value,
          this.cluster.name,
          '',
          'processing...'
        );
      }

      // Disable the POST/Create, PUT/Update and DELETE/Delete buttons.
      if (this.data.post.button || this.data.put.button || this.data.delete.button) {
        const postButton = document.querySelectorAll('[data-ft-button-create="' + this.data.post.button + '"]');
        const putButtons = document.querySelectorAll('[data-ft-button-update="' + this.data.put.button + '"]');
        const deleteButtons = document.querySelectorAll('[data-button-delete="' + this.data.delete.button + '"]');

        [postButton, putButtons, deleteButtons].forEach((buttonList, index) => {
          Array.from(buttonList).forEach((button, buttonIndex) => {
            if (button.querySelector('button')) {
              button.querySelector('button').disabled = true;
            }
          });
        });
      }

      fetch(url, {
        method: requestType,
        body: data,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-CSRFToken': this.data.csrfToken,
        },
      })
        .then((response) => {
          if (!response.ok) {
            response.text().then((text) => {
              this.#handleErrors(requestType, statusMessage, text);
            });
          }

          return response.json();
        })
        .then((data) => {
          // Optional feature -- If present, remove any visible snippet message
          if (this.statusSnippet && this.statusSnippet.length > 0) {
            Array.from(this.statusSnippet).forEach((snippet, index) => {
              snippet.innerHTML = '';
            });
          }

          // If it's a GET Ajax Request, fill the DOM with the elements provided in the REST GET response
          if (requestType == 'GET') {
            if (this.data.get.multi !== true) {
              formUtilities.setFormDataByCluster(this.cluster.attribute.value, data);
            }

            if (this.advancedOptions.customActions && typeof this.data.postProcessing == 'function') {
              this.data.postProcessing(data);
            }
          } else if (requestType == 'POST' || requestType == 'PUT' || requestType == 'DELETE') {
            // Optional feature -- If present, show a "success" notification.
            if (this.alerts) {
              formUtilities.showSubmissionStatusAlert(
                'success',
                this.cluster.attribute.value,
                this.cluster.name,
                'successfully',
                statusMessage,
                6000
              );
            }
          }

          // For POST requests, display the proper urlPath to the saved record (depends on the backend settings).
          if (requestType == 'POST') {
            // Hide the create record button and show the update record button
            if (this.data.post.button || this.data.put.button || this.data.delete.button) {
              const postButtons = document.querySelectorAll('[data-ft-button-create="' + this.data.post.button + '"]');
              const putButtons = document.querySelectorAll('[data-ft-button-update="' + this.data.put.button + '"]');
              const deleteButtons = document.querySelectorAll('[data-button-delete="' + this.data.delete.button + '"]');

              // Show the PUT/Update and DELETE/Delete buttons.
              [putButtons, deleteButtons].forEach((buttonList, index) => {
                Array.from(buttonList).forEach((button, buttonIndex) => {
                  button.hidden = false;
                });
              });

              // Hide the POST/Create button.
              Array.from(postButtons).forEach((button, index) => {
                button.hidden = true;
              });
            }

            if (this.data.post.response.uid.fieldName) {
              // Add in the url the new record id and - if specified - the new url path.
              history.replaceState(
                null,
                null,
                (this.data.post.response.url ? this.data.post.response.url : '') +
                  data[this.data.post.response.uid.fieldName]
              );
            }
          } else if (requestType == 'DELETE') {
            // Hide the create record button and show the update record button.
            if (this.data.post.button && this.data.put.button) {
              const postButtons = document.querySelectorAll('[data-ft-button-create="' + this.data.post.button + '"]');
              const putButtons = document.querySelectorAll('[data-ft-button-update="' + this.data.put.button + '"]');
              const deleteButtons = document.querySelectorAll('[data-button-delete="' + this.data.delete.button + '"]');

              // Hide PUT/Update and DELETE/Delete buttons.
              [putButtons, deleteButtons].forEach((buttonList, index) => {
                Array.from(buttonList).forEach((button, buttonIndex) => {
                  button.hidden = true;
                });
              });

              // Show POST/Create buttons.
              Array.from(postButtons).forEach((button, index) => {
                button.hidden = false;
              });
            }
          }

          // Optional feature -- If enabled, cache a copy of JSON REST data
          if (this.data.cache && requestType != 'DELETE') {
            dataCache[this.cluster.attribute.value] = data;
          }

          // Optional feature -- If enabled, redirect to the specified URL
          if (requestType != 'GET' && redirect == true && this.redirect) {
            formUtilities.redirectToNewPage(this.redirect);
          }

          // Re-enable the POST/Create, PUT/Update and DELETE/Delete buttons.
          if (this.data.post.button || this.data.put.button || this.data.delete.button) {
            const postButtons = document.querySelectorAll('[data-ft-button-create="' + this.data.post.button + '"]');
            const putButtons = document.querySelectorAll('[data-ft-button-update="' + this.data.put.button + '"]');
            const deleteButtons = document.querySelectorAll('[data-button-delete="' + this.data.delete.button + '"]');

            [putButtons, postButtons, deleteButtons].forEach((buttonList, index) => {
              Array.from(buttonList).forEach((button, buttonIndex) => {
                if (button.querySelector('button')) {
                  button.querySelector('button').disabled = false;
                }
              });
            });
          }
        })
        .catch((error) => {
          this.#handleErrors(requestType, statusMessage, error);
        });
    }
  }

  /**
   * Add an event listener to POST/PUT buttons to run data processing.
   *
   * @param {string} requestType Options: 'POST', 'PUT', 'DELETE'. The type of the request to be processed.
   * @param {function} callback Parameter: (Optional) processRequest function. Run a custom set of instruction before
   * executing the function to process the request.
   */
  onButtonClick(requestType, redirect, callback) {
    let button = null;

    if (requestType === 'POST') {
      button = document.querySelectorAll('[data-ft-button-create="' + this.data.post.button + '"]');
    } else if (requestType === 'PUT') {
      button = document.querySelectorAll('[data-ft-button-update="' + this.data.put.button + '"]');
    } else if (requestType === 'DELETE') {
      button = document.querySelectorAll('[data-button-delete="' + this.data.delete.button + '"]');
    }

    button.addEventListener('click', (event) => {
      // Run the callback function before triggering any POST/PUT request.
      if (typeof callback === 'function') {
        const dataProcessing = () => this.processRequest(requestType, redirect);

        callback(dataProcessing);
      } else if (!callback) {
        this.processRequest(requestType, redirect);
      }
    });
  }

  /**
   * Trigger all the actions related to an error.
   *
   * @param {string} requestType The type of the request: GET, POST, PUT.
   * @param {string} statusMessage The status message to be shown, e.g. 'successfully', 'not'.
   * @param {string} error The details of exception.
   */
  #handleErrors(requestType, statusMessage, error) {
    // Optional feature -- If present, show an error message in the snippet.
    if (this.statusSnippet && this.statusSnippet.length > 0) {
      Array(this.statusSnippet).flat().forEach((snippet, index) => {
        snippet.innerHTML = 'Error';
      });
    }

    // Optional feature -- If present, show an error notification.
    if (requestType == 'POST' || requestType == 'PUT' || requestType == 'DELETE') {
      // Optional feature -- If present, show a "success" notification.
      if (this.alerts) {
        formUtilities.showSubmissionStatusAlert(
          'error',
          this.cluster.attribute.value,
          this.cluster.name,
          'NOT',
          statusMessage,
          6000,
          error
        );
      }

      // Re-enable the create and update record buttons.
      const postButton = document.querySelectorAll('[data-ft-button-create="' + this.data.post.button + '"]');
      const putButtons = document.querySelectorAll('[data-ft-button-update="' + this.data.put.button + '"]');

      [postButton, putButtons, deleteButtons].forEach((buttonList, index) => {
        Array.from(buttonList).forEach((button, buttonIndex) => {
          if (button.querySelector('button')) {
            button.querySelector('button').disabled = false;
          }
        });
      });
    }
  }
}
