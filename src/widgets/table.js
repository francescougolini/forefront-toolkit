/**
 * Forefront Toolkit - Table
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as utilities from '../utilities/generic_utilities.js';
import { DataCollection } from '../core/data_collection.js';

/**
 * A class representing a Table, used to process structured data organised in rows and columns.
 *
 * @param {Object} properties The properties necessary to instantiate the table.
 */
export class Table {
  constructor(properties) {
    this.id = 'table-' + Date.now();

    if (properties && properties.pointOfEntry) {
      // The ID of the element in which to insert the table
      this.pointOfEntry = properties.pointOfEntry;

      // Striped Table
      this.striped = properties.striped === false ? false : true;

      // Table modes: 'sticky', 'viewport', 'standard' (default).
      this.mode =
        properties.mode && ['sticky', 'viewport', 'standard'].includes(properties.mode) ? properties.mode : 'standard';

      // Conditional formatting items
      this.conditionalFormatting = properties.conditionalFormatting ? properties.conditionalFormatting : [];

      // Custom actions
      this.customPostProcessing = properties.customPostProcessing ? properties.customPostProcessing : null;

      // Export rows
      this.export =
        properties.export && ['safe', 'raw', 'disabled'].includes(properties.export) ? properties.export : 'disabled';

      // Declare and initialise a global variable to store the table's controls.
      this.controls = {};

      //  DATA PROCESSING
      this.columns = {};

      // Properties of the columns
      this.columns.list = properties.columns ? properties.columns : [];
      this.columns.size = this.columns.list.length;

      if (this.columns.list && this.columns.size > 0) {
        this.columns.labelMap = new Map();

        this.columns.sortMap = new Map();
        this.columns.filterMap = new Map();

        this.columns.visibilityMap = new Map();

        this.cells = {};
        this.cells.typesMap = new Map();

        for (let i = 0; i < this.columns.size; i++) {
          const columnUID = i.toString();

          this.columns.list[i].uid = columnUID;

          const cellType = this.columns.list[i].cellType ? this.columns.list[i].cellType : 'text';
          this.cells.typesMap.set(columnUID, cellType);

          const sortingEnabled =
            this.columns.list[i].sorting === false || this.columns.list[i].sorting === true
              ? this.columns.list[i].sorting
              : true;
          this.columns.sortMap.set(columnUID, sortingEnabled);

          const filteringType = this.columns.list[i].filtering ? this.columns.list[i].filtering : 'none';
          this.columns.filterMap.set(columnUID, filteringType);

          const visible = this.columns.list[i].visible ? this.columns.list[i].visible : true;
          this.columns.visibilityMap.set(columnUID, visible);

          const label = this.columns.list[i].label ? this.columns.list[i].label : '';
          this.columns.labelMap.set(columnUID, label);
        }

        // New Data Collection instance for the handling of data in the table.
        this.data = new DataCollection(this.columns.list);
      } else {
        throw 'Table Error: columns NOT found or invalid.';
      }
    } else {
      throw 'Table Error: properties NOT found or invalid.';
    }
  }

  // TABLE UI ELEMENTS AND EVENTS

  /**
   * Process each column according to the specified cell type.
   *
   * @param {array} row An array representing the content of the row.
   * @param {string} columnUID The UID of the column that will be looked up and processed.
   */
  _setCellStyle(row, columnUID) {
    const type = this.cells.typesMap.get(columnUID) ? this.cells.typesMap.get(columnUID) : 'text';
    const value = row[this.data.variables.maps.index.get(columnUID)];

    let parsedField = '';

    if (type === 'tick' || type === 'tick_plain') {
      parsedField = `<span class="${type === 'tick_plain' ? '' : value === 'false' ? 'text-danger' : 'text-success'}">
                        <span title="${value}"><i class="${
        value === 'false' ? 'bi bi-x-lg' : 'bi bi-check-lg'
      }" role="img" aria-hidden="true"></i></span>
                        <span data-ft-raw-value="${value}" hidden>${value}</span>
                    </span>`;
    } else if (type === 'link') {
      const index = this.data.variables.maps.index.get(columnUID);

      const link = this.columns.list[index].link;

      if (link) {
        const type = link.type ? link.type : 'standard';
        const title = link.title ? link.title : 'Link';
        const url = link.defaultURL ? link.defaultURL : value;
        const label = link.label ? link.label : url;
        const inPageLink = link.inPageLink ? link.inPageLink : '';
        const externalLink = link.externalLinkMark === true ? true : false;
        const targetBlank = link.targetBlank === false ? false : true;

        const refDataField = link.refDataField ? link.refDataField : '';
        const uid = this.data.variables.maps.reverseUids.get(refDataField);

        const EXTERNAL_LINK_ICON = `<span class="ml-2 small" style="position:relative; top:-1px;">
                                      <i class="bi bi-link-45deg" role="img" aria-hidden="true"></i>
                                    </span>`;

        let plainStyle = '';
        let buttonStyle = '';

        if (type === 'plain') {
          plainStyle = 'style="color: inherit;"';
        } else if (type === 'button') {
          buttonStyle = 'class="btn btn-primary btn-sm text-break" role="button"';
        }

        parsedField = `<a href="${
          url + '/' + (uid ? row[this.data.variables.maps.index.get(uid)] : '') + inPageLink
        }" ${buttonStyle} class="${type}" ${plainStyle} data-ft-raw-value="${value}" title="${title}" ${
          targetBlank ? 'target="_blank" rel="noreferrer"' : ''
        }>
                        ${label}
                        ${externalLink ? EXTERNAL_LINK_ICON : ''}
                      </a>`;
      } else {
        throw `Table Error: link properties for "${columnUID}" are missing or invalid.`;
      }
    } else {
      parsedField = value;
    }

    return parsedField;
  }

  /**
   * Collect all the unique elements of a given column, and return them as HTML <option> elements.
   *
   * @param {string} columnUID The UID of the column that will be looked up and processed.
   * @param {[string]} data An array of arrays representing the rows of the table.
   * @param {string} optionSelected The value of the option to be marked as selected.
   */
  _createSelectFilterOptions(columnUID, data = [], optionSelected) {
    let uniqueValues = [];

    data.forEach((row, index) => {
      uniqueValues.push(row[this.data.variables.maps.index.get(columnUID)]);
    });

    let options = '<option val=""></option>';

    if (uniqueValues.length > 0) {
      uniqueValues.unique().forEach((value, index) => {
        options += `<option val="${value}" ${optionSelected == value ? 'selected' : ''}>${value}
                            </option>`;
      });
    }

    return options;
  }

  /**
   * Update the status of the sorting toggle according to the sorting Map.
   */
  _setSortingTogglesToDefault() {
    const table = document.querySelector('#' + this.id);

    this.data.variables.maps.defaultOrder.forEach((defaultOrder, columnUID) => {
      const sortingButton = table.querySelector('.sort-' + defaultOrder + '[data-ft-column="' + columnUID + '"]');

      if (sortingButton) {
        sortingButton.classList.add('active');
      }
    });
  }

  /**
   * For each existing header that has a select filter, get the unique values and replace the existing options.
   *
   * @param {[string]} data An array of arrays representing the columns from which to select the values.
   */
  _updateSelectFilterOptions(data = []) {
    const table = document.querySelector('#' + this.id);

    // Update select filters, if they exist.
    this.columns.filterMap.forEach((filterType, columnUID) => {
      if (filterType == 'select') {
        const selectFilter = table.querySelector('select[data-ft-column="' + columnUID + '"]');

        const optionSelected = this.data.variables.maps.filtering.get(columnUID);

        selectFilter.innerHTML = this._createSelectFilterOptions(columnUID, data, optionSelected);
      }
    });
  }

  /**
   * Create a filter input box for a given column.
   *
   * @param {string} columnUID The UID of the column that will be filtered.
   * @param {string} data Default: ''. The data used to retrieved the options for the select filter.
   */
  _createHeaderFilter(columnUID, data) {
    let filter = '';

    const filterType = this.columns.filterMap.get(columnUID) ? this.columns.filterMap.get(columnUID) : 'none';

    if (filterType != 'none' && filterType == 'open') {
      filter = `<input type="text" class="in-table-text-search form-control form-control-sm" 
                  data-ft-column="${columnUID}" aria-label="Filter column">
                </input>`;
    } else if (filterType != 'none' && filterType == 'select') {
      const targetData = data ? data : this.data.dataSet;

      filter = `<select  class="in-table-select form-select form-select-sm" data-ft-column="${columnUID}" 
                  aria-label="Filter column">
                  ${this._createSelectFilterOptions(columnUID, targetData)}
                </select>`;
    }

    return filter;
  }

  /**
   * Create the HTML header elements to be added to the table.
   *
   * @param {[string]} data An array of arrays representing the rows. Used to populate select filters.
   */
  _createHeaders(data) {
    // Build the head of the table
    let headers = '';

    let headersCounter = 0;

    this.columns.visibilityMap.forEach((visible, columnUID) => {
      if (visible === true) {
        const roundedCorner =
          headersCounter === 0
            ? 'border-top-left-radius:0.4rem;'
            : headersCounter + 1 === this.columns.visibilityMap.size
            ? 'border-top-right-radius:0.4rem;'
            : '';

        const columnLabel = this.columns.labelMap.get(columnUID);

        if (columnLabel) {
          // Build the head of the table
          headers += `
                        <div class="ft-table-header flex-fill text-center border-top border-end 
                            ${headersCounter === 0 ? 'border-start' : ''} align-top px-4 py-3 bg-light" 
                            style="white-space: nowrap;${roundedCorner}">
                                <div class="d-flex justify-content-between mb-1" style="min-width:7rem;">
                                    <button href="" data-ft-column="${columnUID}" data-ft-sorting="desc" 
                                        data-bs-toggle="button" role="button" id="${this.id}-btn-desc-${columnUID}" 
                                        class="in-table-sorting sorting-btn-${columnUID} sort-desc btn 
                                        btn-outline-secondary m-0 mb-2 me-3 p-0 rounded-circle" 
                                        style="position: relative;top: -0.1rem;min-width: 1.7rem; max-width: 1.7rem; 
                                        min-height: 1.7rem; max-height: 1.7rem;" title="Descending Order" 
                                        ${this.columns.sortMap.get(columnUID) == false ? `hidden` : ''}>
                                            
                                            <span style="position:relative;top:-0.03rem;left:-0.03rem;">&#9660;</span>
                                    
                                    </button>
                                    <div class="mb-2 ${this.columns.sortMap.get(columnUID) == false ? 'mx-auto' : ''}">
                                        <strong>
                                            ${columnLabel !== null || columnLabel !== undefined ? columnLabel : ''}
                                        </strong>
                                    </div>
                                    <button href="" data-ft-column="${columnUID}" data-ft-sorting="asc" data-bs-toggle="button" 
                                        role="button" id="${this.id}-btn-asc-${columnUID}" 
                                        class="in-table-sorting sorting-btn-${columnUID} sort-asc btn btn-outline-secondary 
                                        m-0 mb-2 ms-3 p-0 rounded-circle" 
                                        style="position: relative;top: -0.1rem;min-width: 1.7rem; max-width: 1.7rem; 
                                        min-height: 1.7rem; max-height: 1.7rem;" title="Ascending Order" 
                                        ${this.columns.sortMap.get(columnUID) == false ? `hidden` : ''}>
                                        
                                            <span style="position:relative;top:-0.15rem;left:-0.03rem;">&#9650;</span>
                                    
                                    </button>
                            </div>    
                            <div class="align-self-center">${this._createHeaderFilter(columnUID, data)}</div>  
                        </div>`;
        } else {
          headers += `<div class="ft-table-header flex-fill text-center align-top px-4 py-3" 
                                    style="white-space: nowrap;${roundedCorner}"></div>`;
        }

        headersCounter += 1;
      }
    });

    headersCounter = 0;

    return headers;
  }

  /**
   * Create the HTMl row elements to be added to the table.
   *
   * @param {[string]} data An array of arrays representing the rows to be added to the table.
   */
  _createRows(data) {
    // Build the body of the table
    let rows = '';

    data.forEach((row, index) => {
      let cells = '';

      let cellsCounter = 0;

      this.columns.visibilityMap.forEach((visible, columnUID) => {
        if (visible) {
          // Parse the data of each cell according to its type
          const styledCell = this._setCellStyle(row, columnUID);

          cells += `<div data-ft-table-column="${columnUID}" data-ft-table-cell="${row[columnUID]}"
                            class="ft-table-cell border-bottom border-end ${cellsCounter === 0 ? 'border-start' : ''} 
                            ${index === 0 ? 'border-bottom' : ''} p-2" 
                            style="display:flex;align-items:center;justify-content:center;text-align:center;">
                                ${
                                  styledCell !== null || styledCell !== undefined ? styledCell : ''
                                }                            
                         </div>`;

          cellsCounter += 1;
        }
      });

      cellsCounter = 0;

      rows += `<div data-ft-table-row="${index}" class="ft-table-row d-flex" 
                ${this.striped && index % 2 !== 0 ? 'style="background-color:var(--bs-light);"' : ''}>
                  ${cells}
                </div>`;
    });

    return rows;
  }

  /**
   * Create the HTML table, populated with the headers and the row, fix the styling, and add event listeners.
   *
   * @param {[string]} data An array of arrays representing the rows used to populate the table's body.
   */
  _createTableStructure(data) {
    // Sort Data according to the default Order
    this.data.variables.maps.defaultOrder.forEach((defaultOrder, columnUID) => {
      this.data.variables.maps.sorting.set(columnUID, defaultOrder);
    });

    // Set the data according to the "order" property specified in the manifest.
    data = this.data.sortRecords(data);

    // Create the table's header
    const headers = this._createHeaders(data);

    const tableHead = `<div id="${this.id}-head" class="ft-table-head d-flex border-bottom">
                          ${headers}
                        </div>`;

    // Create the table's body
    let rows = this._createRows(data);

    const tableBody = `<div id="${this.id}-body" class="ft-table-body">
                          ${rows}
                        </div>`;

    // Create the table and add it into the DOM.
    const tableMain = `<div id="${this.id}" class="ft-table-main mb-3">                         
                          ${tableHead}
                          ${tableBody}
                        </div>`;

    const pointOfEntry = document.querySelector('#' + this.pointOfEntry);

    pointOfEntry.innerHTML = tableMain;

    // Add a copy of the post processed data in the temporary rows array.
    this.data.temporaryDataSet = data;

    // Add table management controls to the newly created table.
    this._createTableControls();

    // If present, apply conditional formatting
    this._applyConditionalFormatting();

    // Custom actions: if a custom action function is provided, run it before
    this._runCustomPostProcessing();

    // Set the sorting button on the table's header according to the default orders.
    this._setSortingTogglesToDefault();

    const _arrangeElements = () => {
      const table = document.querySelector('#' + this.id);

      let columnWidths = [];

      Array.from(table.querySelectorAll('div.ft-table-header')).forEach((header, index) => {
        const winObj = header.ownerDocument.defaultView;

        columnWidths.push(winObj.getComputedStyle(header, null).width);
      });

      Array.from(table.querySelectorAll('div.ft-table-row')).forEach((row, rowIndex) => {
        row.querySelectorAll('div.ft-table-cell').forEach((column, index) => {
          column.style.width = columnWidths[index];
        });
      });

      // Adjust the minimum width to fit the smallest width between the table and the point of entry.
      table.style.minWidth =
        Math.min(document.querySelector('#' + this.id + '-head').offsetWidth, pointOfEntry.offsetWidth) + 'px';
    };

    // Make sure the headers and columns have the same width:

    // 1) On load
    _arrangeElements();

    // 2) When resizing
    window.addEventListener('resize', (event) => {
      _arrangeElements();
    });

    // 3) When elements in the table are added/removed.
    const targetNode = document.querySelector('#' + this.id);
    const config = { attributes: true, childList: true, subtree: true };

    const callback = (mutationsList, observer) => {
      _arrangeElements();
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  }

  /**
   * Set the triggers to run data actions (filtering and sorting) and table actions (resetting and exporting).
   */
  _addTableEventListeners() {
    const table = document.querySelector('#' + this.id);

    // FILTERING ---
    Array.from(table.querySelectorAll('.in-table-text-search')).forEach((textFilter, index) => {
      textFilter.addEventListener('input', (event) => {
        let targetColumn = event.target.getAttribute('data-ft-column');
        let value = event.target.value;

        // Add the inputted test (if any) in the global variable "this.data.variables.maps.filtering".
        this.data.variables.maps.filtering.set(targetColumn, value);

        this.refreshTable();
      });
    });

    Array.from(table.querySelectorAll('.in-table-select')).forEach((textFilter, index) => {
      textFilter.addEventListener('change', (event) => {
        let targetColumn = event.target.getAttribute('data-ft-column');
        let value = event.target.value;

        // Add the inputted test (if any) in the global variable "this.data.variables.maps.filtering".
        this.data.variables.maps.filtering.set(targetColumn, value);

        this.refreshTable();
      });
    });

    // SORTING ---
    const sortingButtons = table.querySelectorAll('.in-table-sorting');

    let buttonGroups = [];

    Array.from(sortingButtons).forEach((button, index) => {
      let column = button.getAttribute('data-ft-column');

      if (buttonGroups.length == 0 || !button.buttonGroups.includes(column)) {
        utilities.setToggleButtonsRadioAction('sorting-btn-' + column);
      }

      button.addEventListener('click', (event) => {
        let targetColumn = event.currentTarget.getAttribute('data-ft-column');

        if (!event.currentTarget.classList.contains('active')) {
          // Add the sorting (if any) in the global variable "this.data.variables.maps.sorting".
          this.data.variables.maps.sorting.set(targetColumn, 'none');

          this.refreshTable();
        } else {
          let order = event.currentTarget.getAttribute('data-ft-sorting');

          // Add the sorting (if any) in the global variable "this.data.variables.maps.sorting".
          this.data.variables.maps.sorting.set(targetColumn, order);

          this.refreshTable();
        }
      });
    });
  }

  /**
   * Create a container with the buttons required to perform additional actions, such as reset and export.
   */
  _createTableControls() {
    // Reset button
    const resetButton = `<button type="button" class="btn btn-outline-secondary btn-sm mx-1" 
                          id="${this.id} + '-reset">
                            <i class="bi bi-arrow-repeat" role="img" aria-hidden="true"></i>
                            Reset
                          </button>`;

    const resetButtonContainer = document.createElement('div');
    resetButtonContainer.innerHTML = resetButton;

    this.controls.reset = resetButtonContainer.querySelector('button');
    this.controls.reset.addEventListener('click', (event) => {
      this.resetTable();
      // Make sure only the current object is reached.
      event.stopPropagation();
    });

    // Export button
    const exportButton = `<button type="button" class="btn btn-outline-secondary btn-sm mx-1" 
                            id="${this.id} + '-export" ${this.export === 'disabled' ? 'hidden' : ''}>
                              <i class="bi bi-download" role="img" aria-hidden="true"></i>
                              Export CSV
                            </button>`;

    const exportButtonContainer = document.createElement('div');
    exportButtonContainer.innerHTML = exportButton;

    this.controls.export = exportButtonContainer.querySelector('button');
    // Add event listener only if exporting is enabled, i.e. 'raw' or 'safe' exporting is defined in properties.
    if (this.export === 'raw' || this.export === 'safe') {
      this.controls.export.addEventListener('click', (event) => {
        this._exportData();
        // Make sure only the current object is reached.
        event.stopPropagation();
      });
    }
  }

  /**
   * Fit the table's content within the viewport, and enable scrolling to make sure the table is navigable.
   */
  _enableViewportMode() {
    const tableContainer = document.querySelector('#' + this.id);

    // Horizontal scroll
    tableContainer.style.display = 'block';
    tableContainer.style.overflowX = 'auto';

    const table = document.querySelector('#' + this.id);
    table.style.overflowY = 'auto';

    // Match the width of the table body with the width of the table head.
    const tableHead = document.querySelector('#' + this.id + '-head');
    const tableBody = document.querySelector('#' + this.id + '-body');

    tableBody.style.minWidth = tableHead.scrollWidth + 'px';

    // 1) Enable vertical scroll immediately.
    _enableVerticalScroll();

    // 2) Enable vertical scroll on resize.
    window.addEventListener('resize', (event) => {
      _enableVerticalScroll();
    });

    function _enableVerticalScroll() {
      table.style.height = window.innerHeight - tableContainer.offsetTop - 20 + 'px';
    }

    // 3) Enable vertical scroll when the content of the table is changed.
    const targetNode = document.querySelector('#' + this.id);
    const config = { attributes: true, childList: true, subtree: true };

    const callback = function (mutationsList, observer) {
      _enableVerticalScroll();
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  }

  /**
   * Show a sticky header that is kept visible when the user scroll the table.
   */
  _enableStickyMode() {
    const table = document.querySelector('#' + this.id);

    const tableContainer = document.querySelector('#' + this.id);

    let _setStickyHeader = () => {
      const tableHead = document.querySelector('#' + this.id + '-head');
      const tableBody = document.querySelector('#' + this.id + '-body');

      // 1) Horizontal scroll

      table.style.display = 'block';
      table.style.overflow = 'hidden';
      table.style.width = tableContainer.style.width + 'px';

      // 2) Vertical scroll

      // Insert a outer container that wraps the container to enable horizontal scrolling
      let _createTableOuterContainer = (tableOuterContainerClass, children) => {
        if (!table.querySelector('.' + tableOuterContainerClass)) {
          const tableOuterContainer = document.createElement('div');

          children.parentElement.replaceChild(tableOuterContainer, children);

          tableOuterContainer.appendChild(children);

          tableOuterContainer.classList.add(tableOuterContainerClass);
        }

        return table.querySelector('.' + tableOuterContainerClass);
      };

      // Table head
      const outerHead = _createTableOuterContainer('ft-table-outer-head', tableHead);

      outerHead.style.display = 'block';
      outerHead.style.overflow = 'hidden';
      outerHead.style.width = tableContainer.offsetWidth + 'px';

      tableHead.style.minWidth = table.offsetWidth + 'px';

      // Table Body
      const outerBody = _createTableOuterContainer('ft-table-outer-body', tableBody);

      outerBody.style.display = 'block';
      outerBody.style.overflow = 'auto'; // scroll
      outerBody.style.height = window.innerHeight - outerBody.offsetTop - 20 + 'px';
      outerBody.style.minHeight = tableBody.querySelector('.ft-table-row')
        ? tableBody.querySelector('.ft-table-row').scrollHeight + 'px'
        : '0px';

      outerBody.style.width = outerHead.clientWidth + 'px';

      // Fix the width of the last column to account for the scrollbar.
      Array.from(tableBody.querySelectorAll('.ft-table-row')).forEach((row, index) => {
        row.lastElementChild.style.maxWidth =
          row.lastElementChild.style.width.replace(/[^0-9.]/g, '') -
          (outerBody.offsetWidth - outerBody.clientWidth) +
          'px';
      });

      tableBody.style.height = '100%';
      tableBody.style.width = outerBody.clientWidth + 'px';
      tableBody.style.minWidth = tableHead.scrollWidth - (outerBody.offsetWidth - outerBody.clientWidth) + 'px';

      // Syncronise the horizontal scroll of the table head and the table body.
      outerBody.addEventListener('scroll', (event) => {
        outerHead.scrollTo(outerBody.scrollLeft, outerBody.scrollTop);
      });
    };

    _setStickyHeader();

    // 2) Enable the sticky header the page is resized.
    window.addEventListener('resize', (event) => {
      _setStickyHeader();
    });

    // 3) Enable the sticky header when the content of the table is changed.
    const targetNode = document.querySelector('#' + this.id);
    const config = { attributes: true, childList: true, subtree: true };

    const callback = function (mutationsList, observer) {
      _setStickyHeader();
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  }

  /**
   * Build the table taking in account the table's head width, no matter the viewport or visibility of the headers.
   */
  _enableStandardMode() {
    const tableContainer = document.querySelector('#' + this.id);

    // Horizontal scroll
    tableContainer.style.display = 'block';
    tableContainer.style.overflowX = 'auto';

    // Ensure consistency between table's body and header.
    const tableBody = document.querySelector('#' + this.id + '-body');

    const tableHead = document.querySelector('#' + this.id + '-head');

    tableBody.style.minWidth = tableHead.scrollWidth + 'px';
  }

  /**
   * Check the "mode" property and run the required action.
   */
  _setDisplayMode() {
    if (this.mode == 'sticky') {
      // Sticky mode
      this._enableStickyMode();
    } else if (this.mode == 'viewport') {
      // Viewport mode
      this._enableViewportMode();
    } else {
      // Standard mode
      this._enableStandardMode();
    }
  }

  /**
   * Retrieve the columns that match given string.
   *
   * @param {string/[string]} columns The reference used to identify the columns. A comma-separated string or an array
   * of strings can alternatively be used.
   * @param {string} values A string to be used to include only element which include in their textContent the
   * filtering string.
   * @param {string} condition The condition to be met. Default: 'includes'. Options: '<', '>', '==', etc.
   * @param {string} type Default: 'sourceField'. Options: 'sourceField', 'UID'.
   * @return An array of cells of a/some specified column/s.
   */
  _getColumns(columns, values, condition = 'includes', type = 'sourceField') {
    const table = document.querySelector('#' + this.id);

    columns = typeof columns === 'string' ? columns.split(/,\s{0,}/) : columns ? columns : [];

    let columnUIDs = [];

    if (type === 'sourceField') {
      for (const column of columns) {
        let columnUID = this.data.variables.maps.reverseUids.get(column);

        if (columnUID) {
          columnUIDs.push(columnUID);
        }
      }
    } else {
      columnUIDs = columns;
    }

    const query = columns
      .map((column) => '[data-ft-table-column="' + this.data.variables.maps.reverseUids.get(column) + '"]')
      .join(',');

    const allCells = Array.from(table.querySelectorAll(query));

    let cells = [];

    const parsedValues = values && typeof values === 'string' ? values.split(/,\s{0,}/) : values;

    if (parsedValues) {
      allCells.forEach((cell, index) => {
        if (condition === 'includes') {
          // Check if the content of the cell includes the values.
          parsedValues.forEach((value, index) => {
            if (
              cell.getAttribute('data-ft-table-cell') &&
              cell.getAttribute('data-ft-table-cell').includes(value) &&
              !cells.includes(cell)
            ) {
              cells.push(cell);
            }
          });
        } else if (['>', '<', '>=', '<=', '==', '!=', '===', '!=='].includes(condition)) {
          // Attempt to find a parseable condition that can be met by the cell and the filtering values.
          parsedValues.forEach((value, index) => {
            if (
              cell.getAttribute('data-ft-table-cell') &&
              Function(
                '"use strict"; return "' +
                  cell.getAttribute('data-ft-table-cell') +
                  '" ' +
                  condition +
                  ' "' +
                  value +
                  '";'
              )() &&
              !cells.includes(cell)
            ) {
              cells.push(cell);
            }
          });
        }
      });
    }

    return Array.from(cells);
  }

  /**
   * Retrieve the raw that match a given string.
   *
   * @param {string/[string]} columns The reference used to identify the columns. A comma-separated string or an array of strings can alternatively be used.
   * @param {string} values A string to be used to include only element which include in their textContent the filtering string.
   * @param {string} condition The condition to be met. Default: 'includes'. Options: '<', '>', '==', etc.
   * @param {string} type Default: 'sourceField'. Options: 'sourceField', 'UID'.
   * @returns An array of rows.
   */
  _getRows(columns, values, condition = 'includes', type = 'sourceField') {
    let rows = [];

    if (!columns || columns !== '__all__') {
      const filteredColumns = this._getColumns(columns, values, condition, type);
      rows = filteredColumns.map((column) => column.parentElement);
    } else {
      const allRows = document.querySelector('#' + 'table-test-table').querySelectorAll('[data-ft-table-row]');

      rows = filter ? Array.from(allRows).filter((row, index) => row.textContent.toString().includes(filter)) : allRows;
    }

    return Array.from(rows);
  }

  /**
   * Apply specific formatting to cells or rows that meet given criteria.
   */
  _applyConditionalFormatting() {
    if (this.conditionalFormatting) {
      this.conditionalFormatting.forEach((item, index) => {
        if (item.target === 'cell' && item.columns) {
          this._getColumns(item.columns, item.values, item.condition).forEach((cell, index) => {
            // Make sure the cell has not blank space at the beginning or end of the string.
            if (item.format) {
              const format =
                typeof item.format === 'string' ? item.format.split(/,\s{0,}/) : item.format ? item.format : [];

              format.forEach((stylingClass, index) => {
                cell.classList.add(stylingClass.trim());
              });
            }
          });
        } else if (item.target === 'row' && item.columns) {
          this._getRows(item.columns, item.values, item.condition).forEach((row, index) => {
            if (item.format) {
              const format =
                typeof item.format === 'string' ? item.format.split(/,\s{0,}/) : item.format ? item.format : [];

              format.forEach((stylingClass, index) => {
                row.classList.add(stylingClass.trim());
              });
            }
          });
        }
      });
    }
  }

  /**
   * Modify the visible content of the created table by calling a function specified in the Table Properties Manifest.
   */
  _runCustomPostProcessing() {
    // Custom actions: if a custom action function is provided, run it before
    if (this.customPostProcessing) {
      let queryTools = {};

      queryTools.getColumns = this._getColumns.bind(this);
      queryTools.getRows = this._getRows.bind(this);

      if (this.customPostProcessing && typeof this.customPostProcessing === 'function') {
        this.customPostProcessing(queryTools);
      } else if (this.customPostProcessing && typeof this.customPostProcessing === 'string') {
        Function('"use strict";return ' + this.customPostProcessing)()(queryTools);
      }
    }
  }

  /**
   * Export data in CSV (comma separated value) format.
   */
  _exportData() {
    // Add the header to the exported csv

    const visibleColumnsLabels = [];

    this.columns.visibilityMap.forEach((visible, columnUID) => {
      if (visible) {
        visibleColumnsLabels.push(this.columns.labelMap.get(columnUID));
      }
    });

    let headers = visibleColumnsLabels.join(',') + '\n';

    // Add the rows to the exported csv
    let exportingData = this.data.temporaryDataSet.length > 0 ? this.data.temporaryDataSet : this.data.dataSet;

    let body = exportingData.map((elements) => elements.join(',')).join('\n');

    // If export is set to 'safe', remove the HTML tags from the data.
    headers = this.export === 'safe' ? headers.replace(/<\/?[^>]+(>|$)/g, ' ') : headers;
    body = this.export === 'safe' ? body.replace(/<\/?[^>]+(>|$)/g, ' ') : body;

    let csvContent = 'data:text/csv;charset=utf-8,' + headers + body;

    let encodedUri = encodeURI(csvContent);

    // Name the csv. Format: exported_table_ + UNIX Date + .csv
    let fileName = 'exported_table_' + Date.now() + '.csv';

    const temporaryLink = document.createElement('a');

    temporaryLink.setAttribute('href', encodedUri);

    temporaryLink.setAttribute('download', fileName);

    temporaryLink.click();
    
    temporaryLink.remove();
  }

  // Public methods

  /**
   * Build the table and populate it with the data provided.
   *
   * @param {object} data The key-value-based object representing the records to be included in the table.
   */
  createTable(data) {
    // Build the data collection in order to process them in the table.
    this.data.buildDataCollection(data);

    // Create the HTML representation of the table.
    this._createTableStructure(this.data.dataSet);

    // Add the table-related event listeners.
    this._addTableEventListeners();

    // Enable the defined display mode for the table.
    this._setDisplayMode();
  }

  /**
   * Reset the table without losing the loaded data, but cleaning filtering, sorting and temporary data.
   */
  resetTable() {
    // Clear the temporary rows.
    this.data.temporaryDataSet = [];

    // Clear data filtering and data sorting.
    this.data.variables.maps.filtering.clear();
    this.data.variables.maps.sorting.clear();

    // Recreate the table.
    this._createTableStructure(this.data.dataSet);

    // Re-include the event listeners.
    this._addTableEventListeners();

    // Enable the defined display mode for the table.
    this._setDisplayMode();
  }

  /**
   * Update the body of the table with new data.
   *
   * @param {object} data The data to be added into the table.
   */
  refreshTable() {
    // Refresh only the visible rows.
    let refreshedData = [];

    refreshedData = this.data.dataSet;

    // Sort data
    refreshedData = this.data.sortRecords(refreshedData);

    // Filter data
    refreshedData = this.data.filterRecords(refreshedData);

    // Update select filters, if they exist.
    this._updateSelectFilterOptions(refreshedData);

    const tableBody = document.querySelector('#' + this.id + '-body');

    tableBody.innerHTML = this._createRows(refreshedData);

    // If present, apply conditional formatting
    this._applyConditionalFormatting();

    // If present, run the custom post processing functions to manipulate the DOM elements of the body.
    this._runCustomPostProcessing();

    // Update the temporary row with the refreshed values.
    this.data.temporaryDataSet = refreshedData;
  }

  /**
   * Insert new rows into the body of the table.
   *
   * @param {[string]} data An array of arrays representing the rows to be appended.
   */
  appendRows(data) {
    const tableBody = document.querySelector('#' + this.id + '-body');

    let targetData = data ? data : [];

    const rows = this._createRows(targetData);

    const lastRow = Array.from(tableBody.querySelectorAll('.ft-table-row')).slice(-1)[0];

    if (rows && lastRow) {
      // 1) If there are rows, append after the last.
      lastRow.insertAdjacentHTML('afterend', rows);

      this.refreshTable(this.data.temporaryDataSet.concat(targetData));
    } else if (rows) {
      // 2) If there aren't rows, append before the end of the table's body
      tableBody.insertAdjacentHTML('afterbegin', rows);

      this.refreshTable(this.data.temporaryDataSet.concat(targetData));
    }
  }
}
