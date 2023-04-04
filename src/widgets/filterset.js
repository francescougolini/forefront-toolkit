/**
 * Forefront Toolkit - FilterSet
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as generic_utilities from '../utilities/generic_utilities.js';
import * as date_utilities from '../utilities/date_utilities.js';

/**
 * Class representing a filterSet used to retrieve data according to specified facets and filters.
 *
 * @param {object} properties The properties necessary to instantiate the FilterSet.
 */
export class FilterSet {
  constructor(properties) {
    this.id = 'filterSet-' + Date.now();

    // Class properties required to store data for further processing or usage.
    this.filters = {};

    this.filters.custom = {};
    this.filters.dateRange = {};
    this.filters.dateRange.toggles = {};
    this.filters.sorting = {};

    this.controls = [];

    this.query = {};
    this.query.presets = [];
    this.query.presets.custom = [];
    this.query.presets.custom.default = [];
    this.query.presets.custom.initial = [];
    this.query.presets.timeSpan = {};

    this.query.list = [];

    this.colors = {};
    this.keywords = {};
    this.values = {};

    // Construct the FilterSet Object
    if (properties && properties.pointOfEntry) {
      // The element in which to insert the filterSet.
      this.pointOfEntry = properties.pointOfEntry;

      // FILTERS

      // Open search
      this.filters.openSearch = properties.openSearch ? properties.openSearch : undefined;

      // Daterange
      const dateRange = properties.dateRange ? properties.dateRange : {};

      this.filters.dateRange.visible = dateRange && dateRange.visible ? dateRange.visible : false;

      // Start and End Date Input Fields
      this.filters.dateRange.date = {};

      this.filters.dateRange.date.enabled = dateRange.date && dateRange.date.start && dateRange.date.end ? true : false;

      this.filters.dateRange.date.start = dateRange.date && dateRange.date.start ? dateRange.date.start : undefined;
      this.filters.dateRange.date.end = dateRange.date && dateRange.date.end ? dateRange.date.end : undefined;

      // Start and End Time Input Fields
      this.filters.dateRange.time = {};

      this.filters.dateRange.time.enabled = dateRange.time && dateRange.time.start && dateRange.time.end ? true : false;

      this.filters.dateRange.time.start = dateRange.time && dateRange.time.start ? dateRange.time.start : undefined;
      this.filters.dateRange.time.end = dateRange.time && dateRange.time.end ? dateRange.time.end : undefined;
      this.filters.dateRange.time.coupling =
        dateRange.time && dateRange.time.coupling ? dateRange.time.coupling : false;

      // Daterange Filter - Date Toggles
      const dateToggles = dateRange.toggles ? dateRange.toggles : {};

      this.filters.dateRange.toggles.today = dateToggles.today ? dateToggles.today : false;
      this.filters.dateRange.toggles.thisWeek = dateToggles.thisWeek ? dateToggles.thisWeek : false;
      this.filters.dateRange.toggles.thisMonth = dateToggles.thisMonth ? dateToggles.thisMonth : false;
      this.filters.dateRange.toggles.thisYear = dateToggles.thisYear ? dateToggles.thisYear : false;

      // Custom filters
      this.filters.custom.list = properties.customFilters ? properties.customFilters : [];
      // Sorting filters
      const sorting = properties.sorting && Object.keys(properties.sorting).length !== 0 ? properties.sorting : {};

      this.filters.sorting.fields = sorting.fields && Object.keys(sorting.fields).length !== 0 ? sorting.fields : null;

      this.filters.sorting.keywords = sorting.keywords ? sorting.keywords : [];

      this.filters.sorting.join = sorting.join ? sorting.join : undefined;

      this.filters.sorting.badgeColor = sorting.badgeColor ? sorting.badgeColor : 'bg-light text-primary';

      // ADVANCED OPTIONS

      const advancedOptions =
        properties.advancedOptions && Object.keys(properties.advancedOptions).length !== 0
          ? properties.advancedOptions
          : {};

      // Custom Options
      const queryPresets =
        advancedOptions.queryPresets && Object.keys(advancedOptions.queryPresets).length !== 0
          ? advancedOptions.queryPresets
          : {};

      // Default query
      const customQueryPresets = queryPresets.custom ? queryPresets.custom : [];

      if (customQueryPresets.length > 0) {
        for (let i = 0; i < customQueryPresets.length; i++) {
          const type = customQueryPresets[i].type ? customQueryPresets[i].type : 'default';
          const keyword = customQueryPresets[i].keyword ? customQueryPresets[i].keyword : '';
          const value = customQueryPresets[i].value
            ? customQueryPresets[i].value
            : typeof customQueryPresets[i].value === 'boolean'
            ? customQueryPresets[i].value
            : '';

          if (keyword && (value || value === '' || value === 0 || value === false)) {
            if (type === 'initial') {
              this.query.presets.custom.initial.push([keyword + '=' + value]);
            } else {
              this.query.presets.custom.default.push([keyword + '=' + value]);
            }
          }
        }
      }

      // If specified, add the timeSpan according to predefined date range queries.
      const timeSpanQueryPreset =
        queryPresets.timeSpan && Object.keys(queryPresets.timeSpan).length !== 0 ? queryPresets.timeSpan : {};

      this.query.presets.timeSpan.initial = timeSpanQueryPreset.initial ? timeSpanQueryPreset.initial : '';
      this.query.presets.timeSpan.default = timeSpanQueryPreset.default ? timeSpanQueryPreset.default : '';

      // If specified, add the time span according to custom date range queries.
      if (this.filters.dateRange.date.start || this.filters.dateRange.time.start) {
        // Start Date/Time
        const startDate =
          queryPresets.date &&
          Object.keys(queryPresets.date).length > 0 &&
          queryPresets.date.start &&
          /^\d\d\d\d-\d\d-\d\d$/.test(queryPresets.date.start)
            ? queryPresets.date.start
            : undefined;

        const startTime =
          queryPresets.time &&
          Object.keys(queryPresets.time).length > 0 &&
          queryPresets.time.start &&
          /^\d\d:\d\d$/.test(queryPresets.time.start)
            ? queryPresets.time.start
            : undefined;

        if (startDate && startTime) {
          const date = new Date(startDate);
          const time = startTime.split(':');
          this.query.startDate = new Date(date.setHours(time[0], time[1]));
        } else if (startDate) {
          const date = new Date(startDate);
          this.query.startDate = new Date(date.setHours(0, 0));
        } else if (startTime) {
          const now = new Date();
          const time = startTime.split(':');
          this.query.startDate = new Date(now.setHours(time[0], time[1]));
        } else {
          this.query.startDate = null;
        }

        // End Date/Time
        const endDate =
          queryPresets.date &&
          Object.keys(queryPresets.date).length > 0 &&
          queryPresets.date.end &&
          /^\d\d\d\d-\d\d-\d\d$/.test(queryPresets.date.end)
            ? queryPresets.date.end
            : undefined;

        const endTime =
          queryPresets.time &&
          Object.keys(queryPresets.time).length > 0 &&
          queryPresets.time.end &&
          /^\d\d:\d\d$/.test(queryPresets.time.end)
            ? queryPresets.time.end
            : undefined;

        if (endDate && endTime) {
          const date = new Date(endDate);
          const time = endTime.split(':');
          this.query.endDate = new Date(date.setHours(time[0], time[1]));
        } else if (endDate) {
          const date = new Date(endDate);
          this.query.endDate = new Date(date.setHours(0, 0));
        } else if (endTime) {
          const now = new Date();
          const time = endTime.split(':');
          this.query.endDate = new Date(now.setHours(time[0], time[1]));
        } else {
          this.query.endDate = null;
        }
      }

      // UI RELATED FEATURES

      const colors =
        advancedOptions.colors && Object.keys(advancedOptions.colors).length !== 0 ? advancedOptions.colors : {};

      this.colors.controls = colors.controls ? colors.controls : 'outline-secondary border-0';
      this.colors.toggles = colors.toggles ? colors.toggles : 'outline-primary';
      this.colors.searchButton = colors.searchButton ? colors.searchButton : 'primary';
    } else {
      throw 'FilterSet Error: invalid or missing properties.';
    }
  }

  #addOpenSearchFilter() {
    const openSearch = `<div id="${this.id}-open-search" class="col">
                            <div class="input-group">
                                <input type="text" class="form-control border-secondary" 
                                  name="${this.id}-open-search-field" id="${this.id}-open-search-field" 
                                  placeholder="Open Search" value="" aria-label="Open Search">
                            </div>
                        </div>`;

    return openSearch;
  }

  #addDateRangeFilter(todayButton = false, thisWeekButton = false, thisMonthButton = false, thisYearButton = false) {
    let dateRangeFilter = `
      <div class="date-filter col-auto">
        <div class="input-group input-group-sm">
          <span class="daterange-from-label input-group-text">From</span>
          ${
            this.filters.dateRange.date.start
              ? `<input class="form-control daterange-control daterange-start-date" name="${this.id}-sd-date-input" 
                id="${this.id}-sd-date-input" value="" type="date" style="width:auto;">`
              : ``
          }
          ${
            this.filters.dateRange.time.start
              ? `<input class="form-control daterange-control daterange-start-time" name="${this.id}-sd-time-input" 
                id="${this.id}-sd-time-input" value="" type="time" style="width:auto;">`
              : ``
          }
        </div>
      </div>

      <div class="date-filter col-auto">
        <div class="input-group input-group-sm">
          <span class="daterange-to-label input-group-text">To</span>
          ${
            this.filters.dateRange.date.end
              ? `<input class="form-control daterange-control daterange-end-date" name="${this.id}-ed-date-input" 
                id="${this.id}-ed-date-input" value="" type="date" style="width:auto;">`
              : ``
          }
          ${
            this.filters.dateRange.time.end
              ? `<input class="form-control daterange-control daterange-end-time" name="${this.id}-ed-time-input" 
                id="${this.id}-ed-time-input" value="" type="time" style="width:auto;">`
              : ``
          }
        </div>
      </div>`;

    // Optional Parameters for the daterange fields. Format: ['dom_class/id_name', 'Button Label'].
    if (this.filters.dateRange.date.start && this.filters.dateRange.date.end) {
      const optionalParameters = {
        today: {
          visible: todayButton ? true : false,
          parameters: ['today', 'Today'],
        },
        thisWeek: {
          visible: thisWeekButton ? true : false,
          parameters: ['this-week', 'This Week'],
        },
        thisMonth: {
          visible: thisMonthButton ? true : false,
          parameters: ['this-month', 'This Month'],
        },
        thisYear: {
          visible: thisYearButton ? true : false,
          parameters: ['this-year', 'This Year'],
        },
      };

      const dateTogglesList = Object.keys(optionalParameters);

      let dateToggles = '';

      for (const key of dateTogglesList) {
        if (optionalParameters[key].visible == true) {
          dateToggles += `<button class="date-filter btn btn-sm btn-${this.colors.toggles} toggle-date-buttons 
                          btn-${optionalParameters[key].parameters[0]}" 
                          style="min-width: 3.2rem;" type="button" data-bs-toggle="button" 
                          id="${this.id}-${optionalParameters[key].parameters[0]}" role="button" aria-pressed="false">
                          ${optionalParameters[key].parameters[1]}
                        </button>`;
        }
      }

      dateRangeFilter += dateToggles ? `<div class="col-auto d-flex gap-1 flex-wrap"> ${dateToggles} </div>` : '';

      dateRangeFilter += `<div class="col-auto d-flex gap-1 flex-wrap"> 
                            <button class="clear-daterange btn btn-sm btn-outline-danger" style="min-width: 3.2rem;" 
                              type="button" id="${this.id}-clear-daterange" role="button" aria-pressed="false">
                                Clear
                            </button>
      
                          </div>`;
    }

    this.controls.push({
      name: 'Date',
      icon: 'bi bi-calendar3',
      targetFilter: this.id + '-daterange-filter',
    });

    return dateRangeFilter;
  }

  #addCustomFilter(customFilterProperties) {
    const filter = customFilterProperties.filters ? customFilterProperties.filters : [];

    const filterClass = customFilterProperties.class ? customFilterProperties.class : '';

    const addCustomFilterToggles = (filter, filterClass) => {
      let customFilterToggles = '';

      for (let i = 0; i < Object.keys(filter).length; i++) {
        const name = filter[i].name ? filter[i].name : '';

        const targetField = filter[i].targetField ? filter[i].targetField : '';

        const targetValue = filter[i].targetValue ? filter[i].targetValue : '';

        const color = filter[i].color ? filter[i].color : this.colors.toggles;

        const customFilterToggle = `<button class="btn btn-sm btn-${color} ${filterClass}"
                                        style="min-width: 3.2rem;" type="button" data-bs-toggle="button" 
                                        data-ft-target-field="${targetField}" data-ft-target-value="${targetValue}" 
                                        role="button" aria-pressed="false">
                                          ${name}
                                   </button>`;

        customFilterToggles += customFilterToggle;
      }

      return customFilterToggles;
    };

    const customFilters = `<div class="custom-filter-container d-flex gap-2 flex-wrap">
                              ${addCustomFilterToggles(filter, filterClass)}     
                           </div>`;

    const filterName = customFilterProperties.name ? customFilterProperties.name : '';
    const filterIcon = customFilterProperties.icon ? customFilterProperties.icon : 'fa-bars';

    this.controls.push({
      name: filterName,
      icon: filterIcon,
      targetFilter: filterClass + '-filter',
    });

    return customFilters;
  }

  #addSortingFilter() {
    let ascendingOrderToggles = ``;
    let descendingOrderToggles = ``;

    const sortPriorityBadge = `<span class="badge ${this.filters.sorting.badgeColor} rounded-pill sort-priority-badge me-1"
                                      data-ft-sort-priority="" hidden></span>`;

    for (let i = 0; i < Object.keys(this.filters.sorting.fields).length; i++) {
      if (this.filters.sorting.fields[i].label && this.filters.sorting.fields[i].targetField) {
        ascendingOrderToggles += `<button class="col-auto btn btn-sm btn-${this.colors.toggles} sorting-filter-toggle 
                                        sorting-filter-toggle-${i}" style="min-width: 3.2rem;" 
                                        type="button" data-bs-toggle="button" data-ft-sorting-group="${i}"
                                        data-ft-sort-value="${this.filters.sorting.fields[i].targetField}"
                                        data-ft-sort-order="ascending"
                                        role="button" aria-pressed="false">                                          
                                            ${sortPriorityBadge}
                                            ${this.filters.sorting.fields[i].label}                                  
                                    </button>`;

        descendingOrderToggles += `<button class="col-auto btn btn-sm btn-${this.colors.toggles} sorting-filter-toggle 
                                        sorting-filter-toggle-${i}" style="min-width: 3.2rem;" 
                                        type="button" data-bs-toggle="button" data-ft-sorting-group="${i}"
                                        data-ft-sorting-id="${i}" 
                                        data-ft-sort-value="${this.filters.sorting.fields[i].targetField}"
                                        data-ft-sort-order="descending" 
                                        role="button" aria-pressed="false">                                            
                                            ${sortPriorityBadge}
                                            ${this.filters.sorting.fields[i].label}                                    
                                    </button>`;
      }
    }

    let sorting = `<div class="d-grid gap-2"> 
                      <div id="${this.id}-ascending-order" class="row gap-2">
                        <div class="ascending-order-label col-auto my-auto text-secondary text-center ms-2" 
                          title="Ascending Order">
                            &#9650;
                        </div>
                        <div class="col row gap-2">
                          ${ascendingOrderToggles}
                        </div>
                      </div>
                      <div id="${this.id}-descending-order" class="row gap-2">
                          <div class="descending-order-label col-auto my-auto text-secondary text-center ms-2"
                          title="Descending Order">
                            &#9660;
                          </div>
                          <div class="col row gap-2">
                            ${descendingOrderToggles}
                          </div>
                      </div>
                    </div>`;

    this.controls.push({
      name: 'Sorting',
      icon: 'bi bi-sort-alpha-down',
      targetFilter: this.id + '-sorting-filter',
    });

    return sorting;
  }

  /**
   * Generate a list of buttons to show the content of the FilterSet's filters.
   *
   * @param {Object} controls A dictionary of controls dictionaries, populated when the filter is instantiated.
   */
  #addControls(controls) {
    const addControlToggles = () => {
      let controlToggles = '';

      for (let i = 0; i < Object.keys(controls).length; i++) {
        const controlName = controls[i].name ? controls[i].name : '';

        const controlIcon = controls[i].icon ? controls[i].icon : '';

        const controlTarget = controls[i].targetFilter ? controls[i].targetFilter : '';

        const controlToggle = `<button type="button" class="filterSet-toggles btn 
                                  btn-sm btn-${this.colors.controls}" 
                                  id="${this.id}-control-${i.toString()}" data-ft-target-filterSet="${controlTarget}" 
                                  data-bs-toggle="button" aria-pressed="false" autocomplete="off" role="button" 
                                  aria-pressed="false">
                                    <span><i class="${controlIcon}" role="img" aria-hidden="true"></i></span> 
                                    ${controlName}
                             </button>`;

        controlToggles += controlToggle;
      }

      return controlToggles;
    };

    const filtersControls = `<div class="controls-container row pt-3">
                                <div class="list-filterSet d-flex gap-2">
                                    ${addControlToggles()}
                                </div>
                            </div>`;

    return filtersControls;
  }

  /**
   * Generate a HTML representation of the filters specified in the FilterSet options object.
   */
  #createFilterSet() {
    // BEGIN of the FilterSet Container
    let filterSet = `<div class="filterSet-main-container flex-fill p-3 bg-light">`;

    // FILTERSET OPEN SEARCH

    if (this.filters.openSearch) {
      filterSet += `<div class="search-field-container row" id="${this.id}-open-search-filter"> 
                      ${this.#addOpenSearchFilter()} 
                    </div>`;
    }

    // FILTERSET CONTROLS - PLACEHOLDER

    filterSet += `{{-filterSet-}}`;

    // Filters

    filterSet +=
      this.filters.dateRange.visible || this.filters.custom.list || this.filters.sorting.fields
        ? `<div id="${this.id}-filterSet-filters-options">`
        : '';

    // Build the date range toggles if the keywords for the start and end date toggles are provided.
    if (this.filters.dateRange.visible) {
      filterSet += `<div class="filterSet-blocks pt-3" id="${this.id}-daterange-filter" hidden> 
                      <div class="daterange-container row gap-3">
                          ${this.#addDateRangeFilter(
                            this.filters.dateRange.toggles.today,
                            this.filters.dateRange.toggles.thisWeek,
                            this.filters.dateRange.toggles.thisMonth,
                            this.filters.dateRange.toggles.thisYear
                          )}
                      </div> 
                    </div>`;
    }

    if (this.filters.custom.list) {
      for (let i = 0; i < Object.keys(this.filters.custom.list).length; i++) {
        filterSet += `<div class="filterSet-blocks pt-3" id="${this.filters.custom.list[i]['class']}-filter" 
                          hidden>
                            ${this.#addCustomFilter(this.filters.custom.list[i])}
                        </div>`;
      }
    }

    if (this.filters.sorting.fields) {
      filterSet += `<div class="filterSet-blocks pt-3" id="${this.id}-sorting-filter" hidden>
                        ${this.#addSortingFilter()}
                      </div>`;
    }

    filterSet +=
      this.filters.dateRange.visible || this.filters.custom.list || this.filters.sorting.fields ? '</div>' : '';

    const controlsOptions = this.#addControls(this.controls);

    // END of the FilterSet Container
    filterSet += '</div>';

    // SEARCH BUTTON

    filterSet += `<div class="search-button-container d-flex p-3 ps-0 bg-light">
                      <button class="btn btn-lg btn-${this.colors.searchButton}" type="button" 
                        id="${this.id}-search-button" role="button" title="Search">
                          <span class="d-block"><i class="btn-filter-search bi bi-search" role="img" alt="Search"></i></span>
                      </button>
                  </div>`;

    // Add the FilterSet controls to the FILTERSET CONTROLS PLACEHOLDER.
    filterSet = filterSet.replace('{{-filterSet-}}', controlsOptions);

    return filterSet;
  }

  /**
   * Generate a query string from the custom filters passed in the listGeneratorProperties
   *
   * @param customFilter {Object} An object representing a custom filter.
   */
  #createQueryFromCustomFilters(customFilter) {
    let queryset = [];

    if (customFilter) {
      const activeFilters = document.querySelectorAll('.' + customFilter.class + '.active');

      let queryPairs = [];
      let queryPairsMap = new Map();

      Array.from(activeFilters).forEach((filter, index) => {
        const keyword = filter.getAttribute('data-ft-target-field');
        const value = filter.getAttribute('data-ft-target-value');

        if (keyword && value) {
          if (filter.classList.contains('active')) {
            queryPairs.push([keyword, value]);
          }
        }
      });

      queryPairs.forEach((pair, index) => {
        const pairGroup = queryPairsMap.get(pair[0]);
        if (pairGroup) {
          pairGroup.push(pair[1]);
        } else {
          queryPairsMap.set(pair[0], [pair[1]]);
        }
      });

      // If multiple filter values are allowed and a separator is provided in join, join the values.
      if (!customFilter.switchToggles && customFilter.join) {
        Array.from(queryPairsMap).forEach((pair, index) => {
          const uniqueValues = pair[1].unique();
          queryset.push(pair[0] + '=' + uniqueValues.join(customFilter.join));
        });
      } else {
        queryset = queryPairs.map((pair, index) => {
          return pair[0] + '=' + pair[1];
        });

        if (queryset.length > 1) {
          queryset = queryset.unique();
        }
      }
    }

    return queryset;
  }

  /**
   * Initialise the FilterSet in the DOM and enable the relevant UI actions.
   */
  initialise() {
    // If a filterSet control element is specified, display the filter in the DOM.
    if (this.filters.openSearch || this.filters.dateRange.visible || this.filters.custom.list) {
      const filterSet = this.#createFilterSet();

      const filterSetContainer = `<div id="${this.id}" class="d-flex border" style="border-radius:0.4rem;">
                                  ${filterSet}
                                </div>`;

      const pointOfEntry = document.querySelector('#' + this.pointOfEntry);
      pointOfEntry.innerHTML = filterSetContainer;
    }

    // If existing, set the initial custom query.
    if (this.query.presets.custom.initial) {
      this.query.list = this.query.list.concat(this.query.presets.custom.initial);
    }

    // If existing, set the initial time span query.
    if (this.query.presets.timeSpan.initial) {
      this.#setTimeSpanPresets(this.query.presets.timeSpan.initial);
    }

    // Daterange actions and behaviour.
    this.#activateDateRangeToggles();
    this.#activateDateRangeClearButton();

    // Toggle buttons actions and behaviour.
    const filterSetContainer = document.querySelector('#' + this.id);

    generic_utilities.setToggleButtonsRadioAction('filterSet-toggles');

    const filterSetToggles = filterSetContainer.querySelectorAll('.filterSet-toggles');

    Array.from(filterSetToggles).forEach((toggle, index) => {
      toggle.addEventListener('click', (event) => {
        let isActive = false;

        if (toggle.classList.contains('active')) {
          isActive = true;
        } else {
          isActive = false;
        }

        const targetFilterSet = document.querySelector('#' + toggle.getAttribute('data-ft-target-filterSet'));

        if (isActive) {
          const filterSetBlocks = filterSetContainer.querySelectorAll('.filterSet-blocks');

          Array.from(filterSetBlocks).forEach((block, index) => {
            block.hidden = true;
          });

          targetFilterSet.hidden = false;
        } else {
          targetFilterSet.hidden = true;
        }
      });
    });

    // Sorting toggle button actions
    const sortingFilter = document.querySelector('#' + this.id + '-sorting-filter');

    if (this.filters.sorting.fields) {
      for (let i = 0; i < this.filters.sorting.fields.length; i++) {
        if (this.filters.sorting.fields[i]['label'] && this.filters.sorting.fields[i].targetField) {
          generic_utilities.setToggleButtonsRadioAction('sorting-filter-toggle-' + i);
        }
      }

      // An object representing the number of selected toggles globally and per ordering type.
      let priorityCounters = {
        global: 0,
        ascending: 0,
        descending: 0,
      };

      // All the toggles used to sort fields.
      const sortingToggles = sortingFilter.querySelectorAll('.sorting-filter-toggle');

      // An array with the object containing ascending and descending order's keywords.
      const orderSpecificKeywords = this.filters.sorting.keywords.filter((keyword, index) => {
        return keyword.type && ['ascending', 'descending'].includes(keyword.type);
      });

      /**
       * Deselect a sorting toggle.
       *
       * @param {Element} elementToRemove The DOM element to be removed.
       */
      const removeDeselectedItem = (elementToRemove) => {
        const fieldSortPriority = elementToRemove.getAttribute('data-ft-sort-priority');
        const lastFieldSortPriority = priorityCounters.global;

        // Remove from the global counter the deselected toggle.
        if (priorityCounters.global >= 0) {
          priorityCounters.global -= 1;
        }

        // Remove from the order-specific counter the deselected toggle.
        if (
          priorityCounters.ascending >= 0 &&
          elementToRemove.parentElement.getAttribute('data-ft-sort-order') === 'ascending'
        ) {
          priorityCounters.ascending -= 1;
        } else if (
          priorityCounters.descending >= 0 &&
          elementToRemove.parentElement.getAttribute('data-ft-sort-order') === 'descending'
        ) {
          priorityCounters.descending -= 1;
        }

        // Make sure the removal is reflected in the sorting badge and in the data attribute.
        for (let a = fieldSortPriority; a < lastFieldSortPriority + 1; a++) {
          const sortPriorityBadge = sortingFilter.querySelector('[data-ft-sort-priority="' + a + '"]');

          const newCount = sortPriorityBadge.getAttribute('data-ft-sort-priority') - 1;

          if (orderSpecificKeywords.length === 2) {
            if (
              sortPriorityBadge.parentElement.getAttribute('data-ft-sort-order') ==
              elementToRemove.parentElement.getAttribute('data-ft-sort-order')
            ) {
              sortPriorityBadge.textContent = parseInt(sortPriorityBadge.textContent) - 1;
            }
          } else {
            sortPriorityBadge.textContent = newCount;
          }

          sortPriorityBadge.setAttribute('data-ft-sort-priority', newCount);
        }

        elementToRemove.textContent = '';
        elementToRemove.setAttribute('data-ft-sort-priority', '');
        elementToRemove.hidden = true;
      };

      // Add an event listener that include a newly selected toggle in the counter and, consequently, in the query.
      Array.from(sortingToggles).forEach((toggle, index) => {
        toggle.addEventListener('click', (event) => {
          const sortPriorityBadge = toggle.firstElementChild.matches('span.sort-priority-badge')
            ? toggle.firstElementChild
            : null;

          if (toggle.classList.contains('active') && sortPriorityBadge) {
            const fieldGroupNumber = toggle.getAttribute('data-ft-sorting-group');

            const fieldGroup = sortingFilter.querySelector(
              '[data-ft-sorting-group="' + fieldGroupNumber + '"] > :not([data-ft-sort-priority=""])'
            );

            if (fieldGroup) {
              removeDeselectedItem(fieldGroup);
            }

            // Include the newly selected toggle in the global counter.
            priorityCounters.global += 1;

            // Include the newly selected toggle in the order-specific counter.
            if (toggle.getAttribute('data-ft-sort-order') === 'ascending') {
              priorityCounters.ascending += 1;
            } else if (toggle.getAttribute('data-ft-sort-order') === 'descending') {
              priorityCounters.descending += 1;
            }

            // TODO: add check for ascending and descending
            if (orderSpecificKeywords.length === 2) {
              if (toggle.getAttribute('data-ft-sort-order') === 'ascending') {
                sortPriorityBadge.textContent = priorityCounters.ascending;
              } else if (toggle.getAttribute('data-ft-sort-order') === 'descending') {
                sortPriorityBadge.textContent = priorityCounters.descending;
              }
            } else {
              sortPriorityBadge.textContent = priorityCounters.global;
            }

            sortPriorityBadge.setAttribute('data-ft-sort-priority', priorityCounters.global);
            sortPriorityBadge.hidden = false;
          } else if (sortPriorityBadge) {
            removeDeselectedItem(sortPriorityBadge);
          }
        });
      });
    }

    // Ensure the Start Date and End Date "to" and "from" label have the same width
    if (this.filters.dateRange.visible) {
      filterSetContainer
        .querySelector('[data-ft-target-filterSet=' + this.id + '-daterange-filter]')
        .addEventListener('click', (event) => {
          generic_utilities.matchElementWidth('padding', 'daterange-from-label', 'daterange-to-label');
          event.stopPropagation();
        });
    }

    // If the "switchToggles" options is true, set the buttons of that custom filter to behave as switch toggles.
    if (this.filters.custom.list) {
      for (const customFilter of this.filters.custom.list) {
        if (customFilter.switchToggles && customFilter.class) {
          generic_utilities.setToggleButtonsRadioAction(customFilter.class);
        }
      }
    }
  }

  /**
   * Return the DOM representation of the search button.
   */
  getSearchButton() {
    return document.querySelector('#' + this.id + '-search-button');
  }

  /**
   * Set the query according to pre-defined date range properties.
   *
   * @param {string} timeSpan The type of time span preset. Options: 'all', 'this_year', 'this_month', 'this_week',
   *                          'today', 'this_year_month', 'dayspan_' + days.
   */
  #setTimeSpanPresets(timeSpan) {
    if (timeSpan) {
      switch (timeSpan) {
        case 'today':
          this.#getTodayRecords();
          break;

        case 'thisWeek':
          this.#getThisWeekRecords();
          break;

        case 'thisMonth':
          this.#getThisMonthRecords();
          break;

        case 'thisMonthSoFar':
          this.#getThisMonthSoFarRecords();
          break;

        case 'thisYear':
          this.#getThisYearRecords();
          break;

        case 'all':
          break;

        case (timeSpan.match(/day_span_\d{1,}/) || {}).input:
          const daySpan = this.filter.replace(/day_span_/, '');
          this.#getRecordsByDays(daySpan);
          break;

        case 'fromToday':
          this.#getFromTodayRecords();
          break;

        case 'tomorrow':
          this.#getTomorrowRecords();
          break;
      }
    }
  }

  // Get the input searched records and, optionally, update the list.
  #getSearchQueryRecords() {
    const openSearchField = document.querySelector('#' + this.id + '-open-search-field');

    this.query.search = openSearchField.value ? openSearchField.value : '';
  }

  // Get the query to sort elements by a predefined order.
  #getSortingQuery() {
    if (this.filters.sorting.keywords) {
      const sortingFilter = document.querySelector('#' + this.id + '-sorting-filter');
      const sortingToggles = sortingFilter.querySelectorAll('.sorting-filter-toggle.active');

      const keywords = this.filters.sorting.keywords;

      // If it's a generic keyword, use a '-' to define descending order.
      if (keywords.length === 1 && keywords[0].type === 'generic') {
        let fields = [];

        // Order toggles.
        const orderedSortingToggles = Array.from(sortingToggles).sort((toggleA, toggleB) => {
          return (
            toggleA.querySelector('span').getAttribute('data-ft-sort-priority') -
            toggleB.querySelector('span').getAttribute('data-ft-sort-priority')
          );
        });

        orderedSortingToggles.forEach((toggle, index) => {
          const order = toggle.getAttribute('data-ft-sort-order') === 'descending' ? '-' : '';
          fields.push(order + toggle.getAttribute('data-ft-sort-value'));
        });

        if (fields.length > 0) {
          if (this.filters.sorting.join) {
            const query = keywords[0].keyword + '=' + fields.join(this.filters.sorting.join);
            this.query.list.push(query);
          } else {
            fields.forEach((field, index) => {
              const query = keywords[0].keyword + '=' + field;
              this.query.list.push(query);
            });
          }
        }
      } else if (keywords.length > 1) {
        const orderSpecificKeywords = keywords.filter((keyword, index) => {
          return keyword.type && ['ascending', 'descending'].includes(keyword.type);
        });

        if (orderSpecificKeywords.length === 2) {
          let ascendingValues = [];
          let descendingValues = [];

          // Order toggles. The data attribute is global and keeps the order even for order-specific toggles.
          const orderedSortingToggles = Array.from(sortingToggles).sort((toggleA, toggleB) => {
            return (
              toggleA.querySelector('span').getAttribute('data-ft-sort-priority') -
              toggleB.querySelector('span').getAttribute('data-ft-sort-priority')
            );
          });

          orderedSortingToggles.forEach((toggle, index) => {
            if (toggle.getAttribute('data-ft-sort-order') === 'descending') {
              descendingValues.push(toggle.getAttribute('data-ft-sort-value'));
            } else if (toggle.getAttribute('data-ft-sort-order') === 'ascending') {
              ascendingValues.push(toggle.getAttribute('data-ft-sort-value'));
            }
          });

          const addSortingQuery = (orderType, values = []) => {
            if (values.length > 0) {
              orderSpecificKeywords.forEach((keywordObject, index) => {
                if (keywordObject.type === orderType) {
                  if (this.filters.sorting.join) {
                    const query = keywordObject.keyword + '=' + values.join(this.filters.sorting.join);
                    this.query.list.push(query);
                  } else {
                    values.forEach((value, index) => {
                      const query = keywordObject.keyword + '=' + value;
                      this.query.list.push(query);
                    });
                  }
                }
              });
            }
          };

          addSortingQuery('ascending', ascendingValues);
          addSortingQuery('descending', descendingValues);
        }
      }
    }
  }

  /**
   * Build the query with search arguments, filters, and sorting arguments.
   *
   * @returns A string containing the query to be searched.
   */
  getSearchQuery() {
    // Date Range Query
    if (this.filters.dateRange.date.enabled || this.filters.dateRange.time.enabled) {
      this.#getDateRangeRecords();
    }

    const setDateRangeQuery = (dateKeyword, timeKeyword, query) => {
      if ((dateKeyword || timeKeyword) && query) {
        const date =
          query.getFullYear() +
          '-' +
          (query.getMonth() < 10 ? '0' : '') +
          (query.getMonth() + 1) +
          '-' +
          (query.getDate() < 10 ? '0' : '') +
          query.getDate();

        const time =
          (query.getHours() < 10 ? '0' : '') +
          query.getHours() +
          ':' +
          (query.getMinutes() < 10 ? '0' : '') +
          query.getMinutes();

        if (this.filters.dateRange.date.enabled && this.filters.dateRange.time.enabled) {
          if (this.filters.dateRange.time.coupling) {
            dateQueryset.push([dateKeyword, date + timeKeyword + time]);
          } else {
            dateQueryset.push([dateKeyword, date]);
            dateQueryset.push([timeKeyword, time]);
          }
        } else if (this.filters.dateRange.date.enabled) {
          return [dateKeyword, date];
        } else if (this.filters.dateRange.time.enabled) {
          return [timeKeyword, time];
        } else {
          return [];
        }
      }
    };

    const dateQueryset = [];

    dateQueryset.push(
      setDateRangeQuery(this.filters.dateRange.date.start, this.filters.dateRange.time.start, this.query.startDate)
    );
    dateQueryset.push(
      setDateRangeQuery(this.filters.dateRange.date.end, this.filters.dateRange.time.end, this.query.endDate)
    );

    dateQueryset.forEach((value, index) => {
      if (value && value[0] && value[1]) {
        this.query.list.push(value[0] + '=' + value[1]);
      }
    });

    // Custom Filters - Query
    if (this.filters.custom.list && this.filters.custom.list.length > 0) {
      this.filters.custom.list.forEach((customFilter, index) => {
        const query = this.#createQueryFromCustomFilters(customFilter);
        this.query.list = this.query.list.concat(query);
      });
    }

    // Default Query - Custom Query
    if (this.query.presets.custom.default.length > 0) {
      this.query.list = this.query.list.concat(this.query.presets.custom.default);
    }

    // Open Search Query
    if (this.filters.openSearch) {
      this.#getSearchQueryRecords();

      if (this.query.search) {
        this.query.list.push(this.keywords.search + '=' + this.query.search);
      }
    }

    // Sorting Query
    if (this.filters.sorting.fields) {
      this.#getSortingQuery();
    }

    // Filters query
    const query = this.query.list.length > 0 ? this.query.list.join('&') : '';

    // Reset global variable
    this.query.list = [];
    this.query.startDate = '';
    this.query.endDate = '';
    this.query.search = '';
    this.query.sorting = '';

    return query;
  }

  // DATE FILTER FUNCTIONS

  /**
   * Get this year all records and, optionally, update the list.
   */
  #getThisYearRecords() {
    const today = new Date();

    this.query.startDate = new Date(today.getFullYear(), 0, 1, 0, 0);
    this.query.endDate = new Date(today.getFullYear(), 11, 31, 23, 59);
  }

  /**
   * Get this month all records and, optionally, update the list.
   */
  #getThisMonthRecords() {
    const today = new Date();
    const yearValue = today.getFullYear();
    const monthValue = today.getMonth();

    const dateRange = new date_utilities.DateRange(yearValue, monthValue);

    this.query.startDate = dateRange.getStartDate();
    this.query.endDate = dateRange.getEndDate();
  }

  /**
   * Get all the records for this month so far.
   */
  #getThisMonthSoFarRecords() {
    const today = new Date();

    this.query.startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
    this.query.endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      today.getHours(),
      today.getMinutes(),
      today.getSeconds()
    );
  }

  /**
   * Get this week records and, optionally, update the list.
   */
  #getThisWeekRecords() {
    const today = new Date();

    const weekNumber = date_utilities.getISOWeekNumber(today);
    let thisWeekStartDate = date_utilities.getWeekStartDate(today.getFullYear(), weekNumber);

    // Start Date
    this.query.startDate = new Date(
      thisWeekStartDate.getFullYear(),
      thisWeekStartDate.getMonth(),
      thisWeekStartDate.getDate()
    );

    // End Date
    const thisWeekEndDate = thisWeekStartDate;

    thisWeekEndDate.setDate(thisWeekEndDate.getDate() + 6);

    this.query.endDate = new Date(thisWeekEndDate.getFullYear(), thisWeekEndDate.getMonth(), thisWeekEndDate.getDate());
  }

  /**
   * Get today's records and, optionally, update the list.
   */
  #getTodayRecords() {
    let today = new Date();

    this.query.startDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), 0, 0, 0);
    this.query.endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), 23, 59, 59);
  }

  /**
   * Get tomorrow's records and, optionally, update the list.
   */
  #getTomorrowRecords() {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.query.startDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0);

    this.query.endDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);
  }

  /**
   * Get records from today onwards, optionally, update the list.
   */
  #getFromTodayRecords() {
    const today = new Date();

    this.query.startYear = today.getFullYear();
    this.query.startMonth = today.getMonth();
    this.startDay = today.getDate();

    this.query.startDate = new Date(this.query.startYear, this.query.startMonth, this.startDay, 0, 0, 0);
    this.query.endDate = '';
  }

  /**
   * Get records by number of days and, optionally, update the list.
   *
   * @param {number} daySpan  The numbers of days in the past.
   */
  #getRecordsByDays(daySpan) {
    const today = new Date();

    let pastDate = new Date();

    pastDate.setDate(pastDate.getDate() - daySpan);

    this.query.endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), 0, 0, 0);
    this.query.startDate = new Date(pastDate.getFullYear(), pastDate.getMonth() + 1, pastDate.getDate(), 23, 59, 59);
  }

  /**
   * Get the date range records
   */
  #getDateRangeRecords() {
    if (!this.query.startDate && !this.query.endDate) {
      const startDateInput = this.filters.dateRange.date.enabled
        ? document.querySelector('#' + this.id + '-sd-date-input')
        : null;
      const startDate = startDateInput && startDateInput.value ? startDateInput.value : '';

      const endDateInput = this.filters.dateRange.date.enabled
        ? document.querySelector('#' + this.id + '-ed-date-input')
        : null;
      const endDate = endDateInput && endDateInput.value ? endDateInput.value : '';

      const startTimeInput = this.filters.dateRange.time.enabled
        ? document.querySelector('#' + this.id + '-sd-time-input')
        : null;
      const startTime = startTimeInput && startTimeInput.value ? startTimeInput.value.split(':') : [];

      const endTimeInput = this.filters.dateRange.time.enabled
        ? document.querySelector('#' + this.id + '-ed-time-input')
        : null;
      const endTime = endTimeInput && endTimeInput.value ? endTimeInput.value.split(':') : [];

      // If no values are provided, check if there are default values. Otherwise, use them.
      if (!startDate && !startTime && !endDate && !endTime && this.query.presets.timeSpan.default) {
        this.#setTimeSpanPresets(this.query.presets.timeSpan.default);
      } else {
        // Set the date according to the values provided and the type of date range.
        const setDateTime = (date, time) => {
          if (date) {
            const dateTime =
              time.length > 0 ? new Date(date).setHours(time[0], time[1]) : new Date(date).setHours(0, 0);
            return new Date(dateTime);
          } else if (this.filters.dateRange.time.enabled && time.length > 0) {
            // If it's just a time range, use today's date as a placeholder.
            const dateTime = new Date().setHours(time[0], time[1]);
            return new Date(dateTime);
          } else {
            return null;
          }
        };

        this.query.startDate = setDateTime(startDate, startTime);
        this.query.endDate = setDateTime(endDate, endTime);
      }
    }
  }

  /**
   * Activate the actions for the date buttons, e.g. the today's date and this week date.
   */
  #activateDateRangeToggles() {
    if (
      this.filters.dateRange.visible &&
      this.filters.dateRange.date.enabled &&
      (this.filters.dateRange.toggles.today ||
        this.filters.dateRange.toggles.thisWeek ||
        this.filters.dateRange.toggles.thisMonth ||
        this.filters.dateRange.toggles.thisYear)
    ) {
      generic_utilities.setToggleButtonsRadioAction('toggle-date-buttons');

      const dateRangeFilter = document.querySelector('#' + this.id + '-daterange-filter');
      const toggleDateButtons = dateRangeFilter.querySelectorAll('.toggle-date-buttons');

      Array.from(toggleDateButtons).forEach((button, index) => {
        button.addEventListener('click', (event) => {
          if (button.classList.contains('active')) {
            const buttonClasses = button.classList;
            const todayDate = new Date();

            if (buttonClasses.contains('btn-today')) {
              this.#setDateRangeFields('start', todayDate);
              this.#setDateRangeFields('end', todayDate);
            } else if (buttonClasses.contains('btn-this-week')) {
              const weekNumber = date_utilities.getISOWeekNumber(todayDate);

              const thisWeekStartDate = date_utilities.getWeekStartDate(todayDate.getFullYear(), weekNumber);

              this.#setDateRangeFields('start', thisWeekStartDate);

              let thisWeekEndDate = thisWeekStartDate;
              thisWeekEndDate.setDate(thisWeekEndDate.getDate() + 6);

              this.#setDateRangeFields('end', thisWeekEndDate);
            } else if (buttonClasses.contains('btn-this-month')) {
              const thisMonthStartDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);

              this.#setDateRangeFields('start', thisMonthStartDay);

              const thisMonthLastDay = new Date(
                todayDate.getFullYear(),
                todayDate.getMonth(),
                date_utilities.getEndOfMonth(todayDate.getFullYear(), todayDate.getMonth() + 1)
              );

              this.#setDateRangeFields('end', thisMonthLastDay);
            } else if (buttonClasses.contains('btn-this-year')) {
              const thisYearStartDay = new Date(todayDate.getFullYear(), 0, 1);

              this.#setDateRangeFields('start', thisYearStartDay);

              const thisYearEndDay = new Date(todayDate.getFullYear(), 11, 31);

              this.#setDateRangeFields('end', thisYearEndDay);
            }
          } else if (button.classList.contains('active')) {
            const dateRangeControls = dateRangeFilter.querySelectorAll('.daterange-control');

            Array.from(dateRangeControls).forEach((control, index) => {
              control.value = '';
            });
          }
        });
      });

      const dateRangeControls = dateRangeFilter.querySelectorAll('.daterange-control');

      Array.from(dateRangeControls).forEach((control, index) => {
        ['input', 'change'].forEach((eventType, index) => {
          control.addEventListener(eventType, (event) => {
            const activeToggleDateButton = dateRangeFilter.querySelector('.toggle-date-buttons.active');

            if (event !== undefined && activeToggleDateButton) {
              activeToggleDateButton.classList.remove('active');
            }
          });
        });
      });
    }
  }

  /**
   * Add an event listener to the "clear" button.
   */
  #activateDateRangeClearButton() {
    const dateRangeFilter = document.querySelector('#' + this.id + '-daterange-filter');

    const clearDateRangeButton = document.querySelector('#' + this.id + '-clear-daterange');

    clearDateRangeButton.addEventListener('click', () => {
      const dateRangeControls = dateRangeFilter.querySelectorAll('.daterange-control');

      dateRangeControls.forEach((control, index) => {
        control.value = '';
      });

      const toggleDateButtons = dateRangeFilter.querySelectorAll('.toggle-date-buttons');

      toggleDateButtons.forEach((button, index) => {
        if (button.classList.contains('active')) {
          button.dispatchEvent(new Event('click', { bubbles: true }));
        }
      });
    });
  }

  /**
   * Set the day, month and year into a given dd-mm-yyyy date range input field group.
   * ID must be: 'daterange-{start or end}-{day, month or year}'
   *
   * @param {string} dateRangeType The type of the date range: 'start', 'end'
   * @param {number} date The day to be added in the date range's day input field.
   */
  #setDateRangeFields(dateRangeType, date) {
    if (
      this.filters.dateRange.visible &&
      (dateRangeType == 'start' || dateRangeType == 'end') &&
      ((this.filters.dateRange.date.start && this.filters.dateRange.date.end) ||
        (this.filters.dateRange.time.start && this.filters.dateRange.time.end))
    ) {
      const dateRangeDate = document.querySelector('.daterange-' + dateRangeType + '-date');

      dateRangeDate.value =
        date.getFullYear() +
        '-' +
        (date.getMonth() < 10 ? '0' : '') +
        (date.getMonth() + 1) +
        '-' +
        (date.getDate() < 10 ? '0' : '') +
        date.getDate();

      const dateRangeTime = document.querySelector('.daterange-' + dateRangeType + '-time');

      dateRangeTime.value = dateRangeType === 'end' ? '23:59' : '00:00';
    } else {
      throw 'Date range is not correctly formatted. Valid format: "daterange-[end/start]-[year/month/day]".';
    }
  }
}
