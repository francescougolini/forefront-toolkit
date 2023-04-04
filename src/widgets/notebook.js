/**
 * Forefront Toolkit - Notebook
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as date_utilities from '../utilities/date_utilities.js';
import * as formUtilities from '../utilities/form_utilities.js';

/**
 * Class representing an organised set of data.
 *
 * @param {Object} properties The properties necessary to instantiate the Notebook.
 */
export class Notebook {
  constructor(properties) {
    if (properties && properties.pointOfEntry) {
      this.notebook = {};
      this.notebook.attribute = {};

      this.data = {};

      // The element in which to insert the notebook.
      this.pointOfEntry = properties.pointOfEntry;

      const notebook = properties.notebook && Object.keys(properties.notebook).length !== 0 ? properties.notebook : {};

      this.notebook.name = notebook.name ? notebook.name : 'Notebook';
      this.notebook.attribute.name = notebook.attributeName ? notebook.attributeName : 'data-ft-cluster';
      this.notebook.attribute.value = notebook.attributeValue ? notebook.attributeValue : 'notebook';

      this.notebook.id = 'nb-' + this.notebook.attribute.value;

      // Data Processing

      const data = properties.data && Object.keys(properties.data).length !== 0 ? properties.data : {};

      this.data.getURL = data.getURL ? data.getURL : '';
      this.data.postURL = data.postURL ? data.postURL : '';

      this.data.csrfToken = optionalFeatures.csrfToken ? optionalFeatures.csrfToken : '';

      this.data.postProcessing = properties.postProcessing ? properties.postProcessing : null;

      // Columns

      this.sections = {};

      this.sections.list = properties.sections ? properties.sections : [];

      // Sort the sections by the specified order (if any).
      this.sections.list.sort((sectionA, sectionB) => {
        if ((sectionA.order && sectionA.order !== 0) || isNaN(parseInt(sectionA.order))) {
          sectionA.order = Infinity;
        }

        if ((sectionB.order && sectionB.order !== 0) || isNaN(parseInt(sectionB.order))) {
          sectionB.order = Infinity;
        }

        return sectionA.order - sectionB.order;
      });

      // Create the indexes (arrays) required to process the HTTP response.
      this.sections.maps = {};

      this.sections.maps.visible = new Map();
      this.sections.maps.dateType = new Map();

      if (sections.length > 0) {
        let sectionsIndex = 0;

        for (let i = 0; i < this.sections.list.length; i++) {
          const fields =
            this.sections.list[i].fields && Object.keys(this.sections.list[i].fields).length !== 0
              ? this.sections.list[i].fields
              : {};

          // If not specified, default the type of the section to 'text'
          if (!this.sections.list[i].type) {
            this.section.list[i].type = 'text';
          }

          if (this.sections.list[i].type == 'datetime') {
            this.sections.maps.dateType.set(sectionsIndex, fields.section);
          }

          if (this.sections.list[i].visible == true) {
            this.sections.maps.visible.set(sectionsIndex, fields.section);
          }

          sectionsIndex += 1;
        }
      }

      // Generate the basic table, without notes.
      this.#createNotebook();

      // Instantiate a variable to check if there are dynamic values to be retrieve from POST call
      this.notebook.dynamicValues = false;

      for (let index = 0; index < this.sections.list.length; index++) {
        if (dataSourceField == '__dynamic_var__') {
          this.notebook.dynamicValues = true;
          break;
        }
      }

      // Get the status alert DOM element.
      this.notebook.statusAlert = document.querySelector('#' + this.notebook.id + '-no-notes');

      // Show the "Notebook initialised" alert.
      setAlert(this.notebook.statusAlert.id, 'initialised', true);
    } else {
      throw 'Notebook Error: invalid or missing properties.';
    }
  }

  /**
   * Provide a html-formatted string to be used to display the heading of the notebook.
   */
  #createHeading() {
    let labels = '';

    for (const section of this.sections.list) {
      const sectionField = section.fields.section ? section.fields.section : '';

      if (this.sections.maps.visible.get(sectionField)) {
        const wrappedLabel = `<th class="border-0" style="width:15%" scope="col">${
          section.label ? section.label : ''
        }</th>`;

        labels += wrappedLabel;
      }
    }

    const heading = `<thead id="${this.notebook.id}-heading"><tr class="text-center mb-3">${labels}</tr></thead>`;

    return heading;
  }

  /**
   * Provide a html-formatted string to be used to display a note.
   */
  #createNote(values) {
    let allValues = '';

    for (let value of values) {
      value = value ? value : '-';

      const borderRight = i < values.length ? 'border-right' : '';

      const wrappedValue = `<td class="align-middle ${borderRight} border-top-0">${value}</td>`;

      allValues += wrappedValue;
    }

    const note = `<tr class="text-center">${allValues}</tr>`;

    return note;
  }

  #createNotebook() {
    const heading = this.#createHeading();

    const table = `<label for="${this.notebook.id}">${this.notebook.name}</label>
                   <div class="table-container">
                    <table id="${this.notebook.id}" class="table table-md table-striped">

                      ${heading}

                      <tbody class="text-center" id="${this.notebook.id}-body"></tbody>
                      
                    </table>
                  </div>
                  <div class="text-center" id="${this.notebook.id}-no-notes" hidden></div>`;

    const container = document.querySelector('#' + this.pointOfEntry);

    container.innerHTML = table;
  }

  /**
   * Retrieve notes or create a new note.
   *
   * @param {string} requestType - GET or POST HTTP request.
   * @param {object} sourceData - (Optional) An object containing the data to set the value for __dynamic_var__ fields.
   */
  processNotes(requestType, sourceData) {
    // If it's a POST/PUSH request, get form data to be processed
    let note = {};

    // Retrieve the new note (POST/PUT request)
    if (requestType != 'GET') {
      let newNote = formUtilities.getFormData(this.notebook.attribute.name, this.notebook.attribute.value);

      for (const section of this.sections.list) {
        const fields = section.fields && Object.keys(section.fields).length !== 0 ? section.fields : {};

        fields.dataSource = fields.dataSource ? fields.dataSource : '';
        fields.altDataSource = fields.altDataSource ? fields.altDataSource : '';
        fields.section = fields.section ? fields.section : '';

        let value = '';

        // Check if the section is populated using DOM elements or a variable sets in JS.
        if (dataSourceField == '__static_var__' || dataSourceField == '__default_value__') {
          value = fields.altDataSource ? fields.altDataSource : '';
        } else if (dataSourceField == '__dynamic_var__') {
          // If a sourceData object is provided, retrieve the value using the field name of the section.
          if (sourceData) {
            value = sourceData[fields.altDataSource] ? sourceData[fields.altDataSource] : '';
          } else {
            value = '';
          }
        } else if (dataSourceField == '__generated__') {
          value = '';
        } else {
          value = newNote[fields.dataSource] ? newNote[fields.dataSource] : '';
        }

        if (value) {
          note[fields.section] = value;
        }
      }
    }

    setAlert(this.notebook.statusAlert.id, 'loading', true);

    const url = requestType == 'POST' ? this.data.postURL : requestType == 'GET' ? this.data.getURL : '';
    const data = requestType == 'POST' ? JSON.stringify(note) : undefined;

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
          response.text().then((error) => {
            const errorMessage = requestType == 'GET' ? 'not-loaded' : 'not-saved';

            setAlert(this.notebook.statusAlert.id, errorMessage, true);

            console.log(error);
          });
        }

        return response.json();
      })
      .then((notes) => {
        if (Object.keys(notes).length > 0) {
          // If the "no notes" div alert is visible, hide it
          if (this.notebook.statusAlert.hidden == false) {
            setAlert(this.notebook.statusAlert.id, 'no-notes', false);
          }

          // Parse the values of a note
          const processNote = (note) => {
            for (const section of Object.keys(note)) {
              if (this.sections.maps.dateType.get(section)) {
                notes[section] = parseDateTimeField(notes[section]);
              }
            }
          };

          // Process datetime "string" sections to properly displayable notes.
          if (this.sections.dateType.length > 0) {
            if (requestType == 'GET') {
              for (const note of notes) {
                processNote(note);
              }
            } else {
              processNote(notes);
            }
          }

          // Skim the notes and return only the value of sections marked as visible.
          const getVisibleSections = (note) => {
            let visibleSections = [];

            for (const visibleSection of this.sections.maps.visible) {
              for (const section of Object.keys(note)) {
                if (section === visibleSection[1]) {
                  visibleSections.push(note[section]);
                }
              }
            }

            return visibleSections;
          };

          // Custom Post Processing
          if (this.customPostProcessing && typeof this.customPostProcessing === 'function') {
            notes = this.notes.postProcessing(requestType, notes);
          } else if (this.customPostProcessing && typeof this.customPostProcessing === 'string') {
            notes = Function('"use strict";return ' + this.notes.postProcessing)()(requestType, notes);
          }

          // Append the notes when getting the whole list, otherwise prepend the note if it's added (more recent one).
          const body = document.querySelector('#' + this.notebookID + '-body');

          if (requestType == 'GET') {
            // 1. Many notes (GET)

            let bodyContent = '';

            if (this.sections.visible && this.sections.visible.length > 0) {
              for (const note of notes) {
                const visibleValues = getVisibleSections(note);

                const newNote = this.#createNote(visibleValues);

                bodyContent += newNote;
              }
            }

            body.insertAdjacentHTML('beforeend', bodyContent);
          } else {
            // 2. Single line (POST/PUT)

            const visibleValues = getVisibleSections(notes);

            const note = this.#createNote(visibleValues);

            tableBody.insertAdjacentHTML('afterbegin', note);
          }
        } else {
          // If there aren't notes, show the "no notes" div alert.
          setAlert(this.notebook.statusAlert.id, 'no-notes', true);
        }
      })
      .catch((error) => {
        let errorMessage = requestType == 'GET' ? 'not-loaded' : 'not-saved';
        setAlert(this.notebook.statusAlert.id, errorMessage, true);

        console.log(error);
      });
  }

  /**
   * Add a new note (via REST POST).
   *
   * @param {Object} sourceData The object containing the the data used to populate __dynamic_var__ fields.
   */
  addNote(sourceData) {
    if (sourceData) {
      this.processNotes('POST', sourceData);
    } else {
      this.processNotes('POST');
    }
  }

  /**
   * Create a new note (via REST GET).
   */
  getNotes() {
    this.processNotes('GET');
  }
}

/**
 * Parse a string in date/time format.
 *
 * @param {string} value The string to be parsed.
 */
function parseDateTimeField(value) {
  const parsedDate = new Date(value);

  let showDate = true;
  let showTime = true;

  let formattedDate = '';

  if (value) {
    if (value.match(/^\d{2,4}[-\/]{1}\d{1,2}[-\/]{1}\d{2,4}[\w -\/]{1}\d{1,2}\:{1}\d{1,2}\:{1}/)) {
      showDate = true;
      showTime = true;
    } else if (value.match(/^\d{2,4}[-\/]{1}\d{1,2}[-\/]{1}\d{2,4}/)) {
      showDate = true;
      showTime = false;
    } else if (value.match(/^\d{1,2}\:{1}\d{1,2}\:{1}\d{1,2}/)) {
      showDate = false;
      showTime = true;
    }

    formattedDate = date_utilities.getDateTimeInEuFormat(
          parsedDate.getFullYear(),
          parsedDate.getMonth() + 1,
          parsedDate.getDate(),
          parsedDate.getHours(),
          parsedDate.getMinutes(),
          parsedDate.getSeconds(),
          true,
          true,
          showDate,
          showTime
        );
  }

  return formattedDate;
}

/**
 * Show or hide the no-results-found alert.
 *
 * @param {string} containerID The ID of the DIV element containing the message
 * @param {string} type The type of the message: "not-saved" OR "not-loaded" OR "no-notes" or "loading"
 * @param {boolean} show If true, show the message, otherwise hide it.
 */
function setAlert(containerID, type, show) {
  const statusAlert = document.querySelector('#' + containerID);

  if (show == true) {
    // Show note box and load content
    let message = '';

    switch (type) {
      case 'initialised':
        message = 'Notebook initialised.';

        break;

      case 'loading':
        message = 'Notes loading...';

        break;

      case 'no-notes':
        message = 'No notes found.';

        break;

      case 'not-saved':
        message = 'Error: note NOT saved.';

        break;

      case 'not-loaded':
        message = 'Error: note NOT loaded.';

        break;
    }

    statusAlert.innerHTML = message;
    statusAlert.classList.add('alert');
    statusAlert.classList.add('alert-secondary');
    statusAlert.hidden = false;
  } else {
    // Hide note box and clan content

    statusAlert.hidden = true;
    statusAlert.innerHTML = '';

    if (type == 'error') {
      statusAlert.classList.remove('alert');
      statusAlert.classList.remove('alert-danger');
    } else if (type == 'not-found' || type == 'loading') {
      statusAlert.classList.remove('alert');
      statusAlert.classList.remove('alert-secondary');
    }
  }
}
