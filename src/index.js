/**
 * Forefront Toolkit - Index
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// Import ----------------------------------------------------------------------

// Import lodash
import _ from 'lodash';

// Utilities ---

// Import Utilities
import {
  setToggleButtonsRadioAction,
  sanitizeString,
  goToInPageLink,
  populateTwinField,
  matchElementWidth,
  highlightUnmatchedField,
  getData,
  getEncodedData,
  getRESTfulData,
  showLoadingOverlay,
  enableFoldableSections,
} from './utilities/generic_utilities.js';

// Import Date Utilities
import {
  createDateTextField,
  getDateFromString,
  getTodayDate,
  convertIsoDateInEuDate,
  convertEuDateInIsoDate,
  getISOWeekNumber,
  getWeekStartDate,
  getEndOfMonth,
  getDateTimeInEuFormat,
  getDaysInMonth,
  isBusinessDay,
  getBusinessDays,
} from './utilities/date_utilities.js';

import { DateRange } from './utilities/date_utilities.js';

// Import from Workload Utilities
import { Workload } from './utilities/workload_utilities.js';

// Import Form Utilities
import {
  getFormData,
  setFormDataByCluster,
  processFormData,
  setEmptyValues,
  validateForm,
  showSubmissionStatusAlert,
  hideSubmissionStatusAlert,
  createAlertsModule,
  redirectToNewPage,
} from './utilities/form_utilities.js';

// Core ---

// Import Data Collection
import { DataCollection } from './core/data_collection.js';

// Import Data Processor
import { DataProcessor } from './core/data_processor.js';

// Import Data Template
import { DataTemplate } from './core/data_template.js';

// Widgets ---

// Import Table
import { Table } from './widgets/table.js';

// Import FilterSet
import { FilterSet } from './widgets/filterSet.js';

// Import Fetcher
import { Fetcher } from './widgets/fetcher.js';

// Import EntrySet
import { EntrySet } from './widgets/entryset.js';

// Import Notebook
import { Notebook } from './widgets/notebook.js';

// EXPORT ----------------------------------------------------------------------

// Export Generic Utilities
export {
  setToggleButtonsRadioAction,
  sanitizeString,
  goToInPageLink,
  populateTwinField,
  matchElementWidth,
  highlightUnmatchedField,
  getData,
  getEncodedData,
  getRESTfulData,
  showLoadingOverlay,
  enableFoldableSections,
};

// Export Date Utilities
export {
  createDateTextField,
  getDateFromString,
  getTodayDate,
  convertIsoDateInEuDate,
  convertEuDateInIsoDate,
  getISOWeekNumber,
  getWeekStartDate,
  getEndOfMonth,
  getDateTimeInEuFormat,
  getDaysInMonth,
  isBusinessDay,
  getBusinessDays,
};

export { DateRange };

// Export Workload
export { Workload };

// Export Form Utilities
export {
  getFormData,
  setFormDataByCluster,
  processFormData,
  setEmptyValues,
  validateForm,
  showSubmissionStatusAlert,
  hideSubmissionStatusAlert,
  createAlertsModule,
  redirectToNewPage,
};

// Core ---

// Export Data Collection
export { DataCollection };

// Export Data Processor
export { DataProcessor };

// Export Data Template
export { DataTemplate };

// Widgets ---

// Export Table
export { Table };

// Export FilterSet
export { FilterSet };

// Export Fetcher
export { Fetcher };

// Export EntrySet
export { EntrySet };

// Export Notebook
export { Notebook };
