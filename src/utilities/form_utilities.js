/**
 * Forefront Toolkit - Form Utilities
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as date_utilities from './date_utilities.js';

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

/**
 * Generate an object that represent the content harvested in the form according to the data-ft-cluster attribute value.
 *
 * @param {string} domDataAttributeName The DOM "data-" attribute to be used to harvest data. By default is "data-ft-cluster".
 * @param {string} domDataAttributeValue The the name of the module used along with the domDataAttributeName to identify
 *                                       the input fields to be harvested, e.g. contact_data, item_details.
 */
function getFormData(domDataAttributeName, domDataAttributeValue) {
  let dataObject = {};

  domDataAttributeName = domDataAttributeName ? domDataAttributeName : 'data-ft-cluster';

  const domElements = document.querySelectorAll(
    'input[' +
      domDataAttributeName +
      '*="' +
      domDataAttributeValue +
      '"], ' +
      'select[' +
      domDataAttributeName +
      '*="' +
      domDataAttributeValue +
      '"], ' +
      'checkbox[' +
      domDataAttributeName +
      '*="' +
      domDataAttributeValue +
      '"], ' +
      'textarea[' +
      domDataAttributeName +
      '*="' +
      domDataAttributeValue +
      '"]'
  );

  Array.from(domElements).forEach((element, index) => {
    let domFieldValue = element.value ? element.value : '';
    let jsonFieldValue = '';

    let domFieldType = element.getAttribute('data-ft-field-type');

    if (domFieldType) {
      let customField = false;

      switch (domFieldType) {
        case 'textarea':
        case 'select':
        case 'text':
        case 'tel':
          jsonFieldValue = domFieldValue ? domFieldValue.trim() : '';

          break;

        case 'number':
          jsonFieldValue = domFieldValue ? domFieldValue : undefined;

          break;

        case 'date':
          // NB  If "data-ft-set-today-date" is present and set to true, set the date to today's date
          if (
            element.getAttribute('data-ft-set-today-date') == 'true' ||
            element.getAttribute('data-ft-set-today-date') == true
          ) {
            domFieldValue = date_utilities.getTodayDate();
          }

          jsonFieldValue = domFieldValue ? date_utilities.convertEuDateInIsoDate(domFieldValue) : undefined;

          break;

        case 'checkbox':
          jsonFieldValue = element.checked || false;

          break;

        // Custom action IF the source field has to be populated with the content of a label only if a checkbox is true
        // ** data-ft-field-type='label-conditional' data-ft-source-field='' data-target-checkbox-id=''
        case 'checkbox-labelled':
          let checkboxValue = element.checked;
          let checkboxValueField = element.getAttribute('data-ft-source-field');

          let dataTargetCheckboxId = element.id;

          let checkboxLabelText = document
            .querySelector('label[for="' + dataTargetCheckboxId + '"]')
            .textContent.trim();
          let checkboxLabelTextField = element.getAttribute('data-ft-text-source-field');

          dataObject[checkboxValueField] = checkboxValue;
          dataObject[checkboxLabelTextField] = checkboxValue ? checkboxLabelText : '';

          customField = true;

          break;

        /**
         * Both "select-open-choice" and "select-closed-choice" are designed using a value-text-based logic.
         *
         * Custom action IF the select field has an open choice field. In that case, these are the attributes to
         * consider:
         *  - data-ft-field-type='select-choice' data-ft-source-field=''
         *  - data-ft-text-source-field="" data-other-option-value=""
         *  - OPTION TAG: data-ft-other-option-field="true/false"
         *
         * Note: the "other" text field option requires exactly "Other..." in the text. Also, the "other" text field
         * has to be put after the select field
         */
        case 'select-open-choice':
          let selectedStandardChoiceValue = element.value;
          let selectedStandardChoiceValueField = element.getAttribute('data-ft-source-field')
            ? element.getAttribute('data-ft-source-field')
            : '';

          let selectedStandardChoiceText = element.selectedOptions[0].text.trim();
          let selectedStandardChoiceTextField = element.getAttribute('data-ft-text-source-field')
            ? element.getAttribute('data-ft-text-source-field')
            : '';

          let otherChoiceValue = element.querySelector('[data-ft-other-option-field="true"]').value;

          if (element.value == otherChoiceValue) {
            const otherOptionOpenField = document.querySelector(
              '#' + element.getAttribute('data-ft-other-option-field-id')
            );

            selectedStandardChoiceText = otherOptionOpenField.value;
          }

          dataObject[selectedStandardChoiceValueField] = selectedStandardChoiceValue;

          dataObject[selectedStandardChoiceTextField] = selectedStandardChoiceText;

          customField = true;

          break;

        /**
         * Custom action IF the select field has a PREDEFINED CHOICE.
         * Close Choice "other" field:
         * - data-ft-field-type="select-choice"
         * - data-ft-source-field=""
         * - data-ft-text-source-field=""
         */
        case 'select-closed-choice':
          let selectedStandardCloseChoiceValue = element.value;
          let selectedStandardCloseChoiceValueField = element.getAttribute('data-ft-source-field')
            ? element.getAttribute('data-ft-source-field')
            : '';

          let selectedStandardCloseChoiceText = element.selectedOptions[0].text.trim();
          let selectedStandardCloseChoiceTextField = element.getAttribute('data-ft-text-source-field')
            ? element.getAttribute('data-ft-text-source-field')
            : '';

          dataObject[selectedStandardCloseChoiceValueField] = selectedStandardCloseChoiceValue;

          dataObject[selectedStandardCloseChoiceTextField] = selectedStandardCloseChoiceText;

          customField = true;

          break;
      }

      // Set the field value of the fields that do NOT require specific processing.
      if (!customField) {
        let jsonFieldName = element.getAttribute('data-ft-source-field')
          ? element.getAttribute('data-ft-source-field')
          : '';

        if (jsonFieldName) {
          dataObject[jsonFieldName] = jsonFieldValue;
        }
      }
    }
  });

  return dataObject;
}

/**
 * Add data to the form's fields that have the specified DOM "data-ft-cluster" attribute and the "data-ft-source-field" attribute.
 *
 * @param {string} clusterName The value  of the "data-ft-cluster" to be processed.
 * @param {Object} data The data to be added into the target DOM fields.
 * @param {string} clusterDataAttribute Default: 'data-ft-cluster'. The data-* attribute of the cluster.
 */
function setFormDataByCluster(clusterName, data, clusterDataAttribute = 'data-ft-cluster') {
  const domElements = document.querySelectorAll(
    'input[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"], ' +
      'select[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"], ' +
      'checkbox[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"], ' +
      'textarea[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"]'
  );

  Array.from(domElements).forEach((element, index) => {
    let fieldValue;

    switch (element.getAttribute('data-ft-field-type')) {
      case 'date':
        fieldValue = data[element.getAttribute('data-ft-source-field')]
          ? date_utilities.convertIsoDateInEuDate(data[element.getAttribute('data-ft-source-field')], 'spaced')
          : '';

        break;

      case 'select-open-choice':
        fieldValue = data[element.getAttribute('data-ft-source-field')]
          ? data[element.getAttribute('data-ft-source-field')]
          : '';

        let otherChoiceValue = element.querySelector('[data-ft-other-option-field="true"]').value;

        if (data[element.getAttribute('data-ft-source-field')] == otherChoiceValue) {
          const otherOptionOpenField = document.querySelector(
            '#' + element.getAttribute('data-ft-other-option-field-id')
          );

          otherOptionOpenField.value = data[element.getAttribute('data-ft-text-source-field')];
        }

        break;

      case 'checkbox-labelled':
      case 'checkbox':
        let isChecked = data[element.getAttribute('data-ft-source-field')]
          ? data[element.getAttribute('data-ft-source-field')]
          : false;

        element.checked = isChecked;

        break;

      case 'number':
        let numberField =
          data[element.getAttribute('data-ft-source-field')] || data[element.getAttribute('data-ft-source-field')] == 0
            ? data[element.getAttribute('data-ft-source-field')]
            : undefined;

        element.value = numberField;

        break;

      default:
        fieldValue = data[element.getAttribute('data-ft-source-field')]
          ? data[element.getAttribute('data-ft-source-field')]
          : '';

        break;
    }

    if (fieldValue) {
      element.value = fieldValue;
    }

    switch (element.getAttribute('data-ft-field-type')) {
      case 'select':
      case 'select-closed-choice':
      case 'select-open-choice':
        if (fieldValue) {
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }

        break;

      case 'checkbox':
      case 'checkbox-labelled':
        element.dispatchEvent(new Event('change', { bubbles: true }));

        break;

      case 'textarea':
      case 'text':
      case 'tel':
        element.dispatchEvent(new Event('input', { bubbles: true }));

        break;
    }
  });
}

/**
 * Process the data of a form by checking the validating the data collected and, if valid, running a callback function.
 *
 * @param {string} formID The DOM id of the form from which to collect the data.
 * @param {string} clusterName The value of the data-* attribute to identify the cluster in with to look for data.
 * @param {string} requiredFieldClass The DOM class that is used to make fields as required.
 * @param {function} callback The callback function that will actually update the records.
 * @param {string} alertModuleName The name of the alert module to trigger if there are validation errors.
 * @param {string} clusterDataAttribute Default: 'data-ft-cluster'. The data-* attribute of the cluster.
 */
function processFormData(
  formID,
  clusterName,
  requiredFieldClass,
  callback,
  alertModuleName,
  clusterDataAttribute = 'data-ft-cluster'
) {
  // Keep a track of the original required fields
  //let cachedRequiredFields = [];

  const form = document.querySelector('#' + formID);

  const inputs = form.querySelectorAll(
    'input[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"], ' +
      'select[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"], ' +
      'checkbox[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"], ' +
      'textarea[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"]'
  );

  if (requiredFieldClass) {
    Array.from(inputs).forEach((input, index) => {
      if (input.classList.contains(requiredFieldClass)) {
        input.required = true;
      }
    });
  }

  // NOTE: Check data_processor.js to check the class name of the validation alert.
  if (validateForm(formID, clusterName, alertModuleName)) {
    callback();
  }

  if (requiredFieldClass) {
    Array.from(inputs).forEach((input, index) => {
      if (input.classList.contains(requiredFieldClass)) {
        input.required = false;
      }
    });
  }
}

/**
 * Set a default value to a DOM element with the 'data-ft-empty-value-tag' attribute if no value is specified.
 *
 * @param {string} emptyValueTag The default value to be used if no values have been specified.
 * @param {Object} dataObject The object representing the data collected from the form.
 */
function setEmptyValues(emptyValueTag, dataObject) {
  const domElements = document.querySelectorAll(
    'input[data-ft-empty-value-tag*="' +
      emptyValueTag +
      '"], ' +
      'select[data-ft-empty-value-tag*="' +
      emptyValueTag +
      '"], ' +
      'checkbox[data-ft-empty-value-tag*="' +
      emptyValueTag +
      '"], ' +
      'textarea[data-ft-empty-value-tag*="' +
      emptyValueTag +
      '"]'
  );

  Array.from(domElements).forEach((element, index) => {
    let domFieldType = element.getAttribute('data-ft-field-type');

    let existingValue = element.value;

    if (!existingValue) {
      let jsonFieldValue;

      switch (domFieldType) {
        case 'text':
        case 'tel':
          jsonFieldValue = '-';

          break;

        case 'number':
          jsonFieldValue = 0;

          break;

        case 'date':
          jsonFieldValue = null;

          break;
      }

      let jsonFieldName = element.getAttribute('data-ft-source-field')
        ? element.getAttribute('data-ft-source-field')
        : '';

      dataObject[jsonFieldName] = jsonFieldValue;
    }
  });

  return dataObject;
}

/**
 * Validate a given form.
 *
 * @param {string} formID The DOM id of the <form> element.
 * @param {string} clusterName The value of the data-* attribute to identify the cluster in with to look for data.
 * @param {string} alertModule The data-ft-alerts=* value used to identify the alert module.
 * @param {string} clusterDataAttribute Default: 'data-ft-cluster'. The data-* attribute of the cluster.
 *
 * NOTE: see showSubmission alert for the required elements to include in the HTML file, i.e the data-ft-alerts and the
 * data-alert-type attribute.
 */
function validateForm(formID, clusterName, alertModule, clusterDataAttribute = 'data-ft-cluster') {
  let form = document.querySelector('#' + formID);

  const inputs = form.querySelectorAll(
    'input[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"], ' +
      'select[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"], ' +
      'checkbox[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"], ' +
      'textarea[' +
      clusterDataAttribute +
      '*="' +
      clusterName +
      '"]'
  );

  let errorList = [];

  // CUSTOM FIELD CHECKS

  Array.from(inputs).forEach((input, index) => {
    // Custom start/end date check
    if (
      input.getAttribute('data-ft-field-type') === 'date' &&
      input.getAttribute('data-ft-start-date') &&
      input.value
    ) {
      startEndDateCheck(input);
    }

    // Custom telephone number check
    if (input.getAttribute('data-ft-field-type') === 'tel' && input.value) {
      diallingCodeCheck(input);
    }

    // VALIDATION

    if (!input.checkValidity()) {
      if (input.type === 'checkbox') {
        // 1. Check checkbox groups: check if at least one checkbox belonging to the group is ticked.
        // NOTE: works with input (type="checkbox") fields tagged with: "data-ft-checkbox-group" DOM attribute.

        const inputCheckboxGroup = input.getAttribute('data-ft-checkbox-group');

        if (inputCheckboxGroup) {
          let checkboxGroupElements = form.querySelectorAll('[data-ft-checkbox-group="' + inputCheckboxGroup + '"]');

          let checkedCounter = 0;

          Array.from(checkboxGroupElements).forEach((value, index) => {
            checkedCounter += value.checked ? 1 : 0;
          });

          Array.from(errorList).forEach((value, index) => {
            checkedCounter +=
              checkedCounter == 0 && value.matches('[data-ft-checkbox-group="' + inputCheckboxGroup + '"]') ? 1 : 0;
          });

          if (checkedCounter == 0) {
            errorList.push(input);
          }
        }
      } else {
        // 2. Include the other invalid fields, e.g. wrong values or required fields.

        errorList.push(input);
      }
    }
  });

  if (errorList.length > 0) {
    showErrors(errorList, alertModule);

    return false;
  } else {
    return true;
  }

  /**
   * Show a form validation alert.
   *
   * @param {array} errorList An array with the elements that didn't pass the validation.
   * @param {string} alertModule The data-ft-alerts=* value used to identify the alert module.
   */
  function showErrors(errorList, alertModule) {
    if (errorList.length > 0) {
      let missingFields = '';

      Array.from(errorList).forEach((invalidInput, index) => {
        // Make sure data-ft-checkbox-group and data-ft-checkbox-group-label are specified in a (even hidden) span.
        if (invalidInput.getAttribute('data-ft-checkbox-group')) {
          let checkboxGroup = invalidInput.getAttribute('data-ft-checkbox-group');

          let label = form
            .querySelector('input[type="hidden"][data-ft-checkbox-group="' + checkboxGroup + '"]')
            .getAttribute('data-ft-checkbox-group-label');

          missingFields += `<li class="mt-1">
                              <strong>${label ? label : 'Unlabelled Checkbox'}</strong>
                              ${invalidInput.validationMessage ? ': ' + invalidInput.validationMessage : ''}
                              (ref. no sibling checkbox clicked)
                            </li>`;
        } else {
          let label = document.querySelector('label[for="' + invalidInput.id + '"]')
            ? document.querySelector('label[for="' + invalidInput.id + '"]').textContent
            : 'Unlabelled Field';

          // Generic message for the other field
          missingFields += `<li class="mt-1">
                              <strong>${label}</strong>
                              ${invalidInput.validationMessage ? ': ' + invalidInput.validationMessage : ''}
                              (ref. ${invalidInput.id})
                            </li>`;
        }
      });

      let errorMessage = `<ul class="mt-2 mb-0">${missingFields}</ul>`;

      showSubmissionStatusAlert(
        'validation',
        alertModule,
        'The following validation errors were found:',
        '',
        errorMessage,
        'none'
      );
    }
  }
}

/**
 * Show a status alert (e.g. success, fail) and, if it is provided, hide it after a given time.
 *
 * @param {string} targetAlertType The DOM id of the alert box to be shown.
 * @param {string} moduleName The data-* attribute of the elements containing the alerts.
 * @param {string} formName The name of the form to be displayed in the alert's message (e.g. XYZ FORM).
 * @param {string} status The status to be displayed in the alert's message (e.g. SUCCESSFULLY).
 * @param {string} outcome The outcome of the call that is triggering the alert (e.g. SAVED, if it's a POST AJAX call)
 * @param {string} hideTimeOut The time after which the alert will be hidden (in milliseconds). Default is 4000.
 *                             If 'none', the alert does NOT disappear.
 * @param {string} refMessage A string containing more details on the alter (e.g. a response from an AJAX call).
 */
function showSubmissionStatusAlert(targetAlertType, moduleName, formName, status, outcome, hideTimeOut, refMessage) {
  // Hide all alerts associated to the specified module and empty them.
  Array.from(document.querySelectorAll('[data-ft-alerts="' + moduleName + '"] > div')).forEach((alert, index) => {
    alert.hidden = true;
  });

  Array.from(document.querySelectorAll('[data-ft-alerts="' + moduleName + '"] > div')).forEach((alert, index) => {
    alert.innerHTML = '';
  });

  let errorMessage = `<span class="mr-2"><i class="bi bi-info" role="img" aria-hidden="true"></i></span>
                      ${formName} <strong>${status}</strong> ${outcome} ${
    refMessage ? '(Ref.: "' + refMessage + '").' : ''
  }`;

  Array.from(
    document.querySelectorAll('[data-ft-alerts="' + moduleName + '"] > [data-alert-type="' + targetAlertType + '"]')
  ).forEach((alert, index) => {
    alert.hidden = false;
  });

  Array.from(
    document.querySelectorAll('[data-ft-alerts="' + moduleName + '"] > [data-alert-type="' + targetAlertType + '"]')
  ).forEach((alert, index) => {
    alert.innerHTML = errorMessage;
  });

  if (hideTimeOut !== 'none') {
    let alertTimeOut = hideTimeOut ? hideTimeOut : 4000;

    window.setTimeout(function () {
      Array.from(
        document.querySelectorAll('[data-ft-alerts="' + moduleName + '"] > [data-alert-type="' + targetAlertType + '"]')
      ).forEach((alert, index) => {
        alert.hidden = true;
      });

      Array.from(
        document.querySelectorAll('[data-ft-alerts="' + moduleName + '"] > [data-alert-type="' + targetAlertType + '"]')
      ).forEach((alert, index) => {
        alert.innerHTML = '';
      });
    }, alertTimeOut);
  }
}

/**
 * Hide a status alert (e.g. success, fail).
 *
 * @param {string} targetAlertType The DOM id of the alert box to be hidden.
 * @param {string} moduleName The data-* attribute of the element containing the alerts.
 */
function hideSubmissionStatusAlert(targetAlertType, moduleName) {
  const alerts = document.querySelectorAll(
    '[data-ft-alerts="' + moduleName + '"] > [data-alert-type="' + targetAlertType + '"]'
  );

  Array.from(alerts).forEach((alert, index) => {
    alert.hidden = true;
    alert.innerHTML = '';
  });
}

/**
 * Create the HTML code of the alters and insert them in the DOM.
 *
 * @param {string} moduleName Default: 'alerts'. The name of the element in which the alerts will be added.
 * @param {boolean} progress Default: true. Add a progress alert to the alerts module.
 * @param {boolean} success Default: true. Add a success alert to the alerts module.
 * @param {boolean} error Default: true. Add an error alert to the alerts module.
 * @param {boolean} validation Default: true. Add a validation alert to the alerts module.
 */
function createAlertsModule(moduleName = 'alerts', progress = true, success = true, error = true, validation = true) {
  const alertsContainers = document.querySelectorAll('[data-ft-alerts="' + moduleName + '"]');

  const progressAlert = `<div data-alert-type="progress" class="alert alert-secondary mt-4 alert-dismissible progress-alert 
                          ${moduleName}-progress-alert" role="alert" hidden></div>`;

  const successAlert = `<div data-alert-type="success" class="alert alert-success mt-4 alert-dismissible success-alert 
                          ${moduleName}-success-alert" role="alert" hidden></div>`;

  const errorAlert = ` <div data-alert-type="error" class="alert alert-danger mt-4 alert-dismissible error-alert 
                        ${moduleName}-error-alert" role="alert" hidden></div>`;

  const validationAlert = `<div data-alert-type="validation" class="alert alert-danger mt-4 alert-dismissible validation-alert 
                            ${moduleName}-validation-alert" role="alert" hidden></div>`;

  Array.from(alertsContainers).forEach((container, index) => {
    container.innerHTML = `${progress ? progressAlert : ''}
                           ${success ? successAlert : ''}
                           ${error ? errorAlert : ''}
                           ${validation ? validationAlert : ''}`;
  });
}

/**
 * If the redirect option is set to true, open a new page.
 * @param {Object} redirectParameters
 */
function redirectToNewPage(redirectParameters) {
  const targetURL = redirectParameters.url ? redirectParameters.url : '';

  const dynamicPath = document.querySelector('#' + redirectParameters['dynamicPath']);

  const fullURL = targetURL + (dynamicPath.value ? dynamicPath.value : '');

  const blankPage = redirectParameters.blankPage ? redirectParameters.blankPage : false;

  window.open(fullURL, blankPage);
}

// CUSTOM FORM CHECK FUNCTIONS

/**
 * Check if a start/end date group field are valid, i.e. start date precedes end date.
 *
 * @param {Element} input The DOM element to be checked for start/end date validity. The "data-ft-start-date" attribute is
 *                        used to retrieve the "data-ft-end-date" attribute.
 *
 * NOTE: works with input fields tagged with: "data-ft-start-date="{uid}" data-ft-end-date="{uid}"  DOM attribute.
 */
function startEndDateCheck(input) {
  let startEndDateAttribute = input.getAttribute('data-ft-start-date');

  let startDateElements = input.value ? input.value.split('/', 3) : '';

  const endDate = startEndDateAttribute ? form.querySelector('[data-ft-end-date="' + startEndDateAttribute + '"]') : '';

  let endDateElements = endDate ? endDate.value.split('/', 3) : '';

  if (startDateElements && startDateElements.length == 3 && endDateElements && endDateElements.length == 3) {
    let startDateDD = startDateElements[0];
    let startDateMM = startDateElements[1];
    let startDateYY = startDateElements[2];

    let startDateValue = new Date(startDateYY, startDateMM, startDateDD);

    let endDateDD = endDateElements[0];
    let endDateMM = endDateElements[1];
    let endDateYY = endDateElements[2];

    let endDateValue = new Date(endDateYY, endDateMM, endDateDD);

    if (startDateValue.getTime() > endDateValue.getTime()) {
      input.setCustomValidity('End date precedes start date.');
    } else {
      input.setCustomValidity('');
    }
  }
}

/**
 * Check if a 'field_type="tel"' has a validly formatted international dialling code.
 *
 * @param {Element} input The DOM element to check for valid international dialling code formatting.
 *
 * NOTE: required the (type="text") input field to have the "data-ft-field-type="tel" in order to work.
 */
function diallingCodeCheck(input) {
  const telRegExp = /^\+[\d\s]{2,}/g;

  let hasCountryCode = input.value ? telRegExp.test(input.value) : false;

  if (!hasCountryCode) {
    input.setCustomValidity('Invalid telephone number. Make sure that the international dialling code is included.');
  } else {
    input.setCustomValidity('');
  }
}
