/**
 * Forefront Toolkit - Utilities
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

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

/**
 * Allows to toggle a button and untoggle the other ones.
 *
 * @param {string} toggleButtonsClass The DOM class of the buttons that will act like mutually exclusive toggle buttons.
 */
function setToggleButtonsRadioAction(toggleButtonsClass) {
  const toggleButtons = document.querySelectorAll('.' + toggleButtonsClass);

  Array.from(toggleButtons).forEach((value, index) => {
    value.addEventListener('click', (event) => {
      let isActive = false;

      if (value.classList.contains('active')) {
        isActive = true;
      } else {
        isActive = false;
      }

      Array.from(toggleButtons).forEach((value, index) => {
        value.classList.remove('active');
      });

      if (isActive) {
        value.classList.add('active');
      } else {
        value.classList.remove('active');
      }
    });
  });
}

/**
 * Sanitise a string in order to be parse in valid JSON format, e.g. by standardising empty spaces.
 *
 * @param {string} targetString The string to be processed.
 */
function sanitizeString(targetString) {
  targetString = targetString
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");

  return targetString.trim();
}

/**
 * Activate the Bootstrap-like class-tagged Tab specified in a URL.
 */
function goToInPageLink() {
  let pageUrlElements = window.location.href.split('#');

  if (pageUrlElements.length == 2) {
    const pageTab = document.querySelector('#' + pageUrlElements[1]);

    pageTab.dispatchEvent(new Event('click', { bubbles: true }));
    pageTab.dispatchEvent(new Event('blur', { bubbles: true }));
  }
}

/**
 * Populate a field (and set a change listener) for dynamically added DOM elements.
 *
 * @param {string} originalFieldID The DOM id of the original DOM element.
 * @param {String} targetFieldID The DOM id of the target element.
 */
function populateTwinField(originalFieldID, targetFieldID) {
  const originalField = document.querySelector('#' + originalFieldID);
  const targetField = document.querySelector('#' + targetFieldID);

  function populateField(originalField, targetField) {
    targetField.value = originalField.value ? originalField.value.trim() : '';
  }

  if (originalField.value) {
    populateField(originalField, targetField);
  }

  ['input', 'change'].forEach((eventType, index) => {
    originalField.addEventListener(eventType, (event) => {
      populateField(originalField, targetField);
    });
  });
}

/**
 * Match the width of a DOM element to another. The DOM element format must be: <div><span></span></div>.
 *
 * @param {string} spacingType The CSS element whose width has to be changed, i.e. 'padding' or 'margin'.
 * @param {string} referenceItemClass The DOM class of the elements whose (first) width is used to set the other elements size.
 * @param {string} targetSpanClass The DOM class of the elements whose width will be changed according to the reference items' one.
 * @param {string} alignment Default: 'center'. Specify the alignment of the content of the DOM element. Options: 'center', 'left'
 */
function matchElementWidth(spacingType, referenceItemClass, targetSpanClass, alignment = 'center') {
  const targetSpans = document.querySelectorAll('.' + targetSpanClass);

  Array.from(targetSpans).forEach((value, index) => {
    const referenceItem = document.querySelector('.' + referenceItemClass);

    let dateFilterLabelsDiff = referenceItem.offsetWidth - value.offsetWidth;

    let innerSpanSpacingRight = window
      .getComputedStyle(value, null)
      .getPropertyValue(spacingType + '-right')
      .replace('px', '');
    let innerSpanSpacingLeft = window
      .getComputedStyle(value, null)
      .getPropertyValue(spacingType + '-left')
      .replace('px', '');

    if (alignment == 'left') {
      value.style[spacingType + '-right'] = +innerSpanSpacingRight + +dateFilterLabelsDiff + 'px';
    } else if (alignment == 'right') {
      value.style[spacingType + '-left'] = +innerSpanSpacingLeft + +dateFilterLabelsDiff + 'px';
    } else {
      value.style[spacingType + '-right'] = +innerSpanSpacingRight + +dateFilterLabelsDiff / 2 + 'px';
      value.style[spacingType + '-left'] = +innerSpanSpacingLeft + +dateFilterLabelsDiff / 2 + 'px';
    }
  });
}

/**
 * Aet a default value to a secondary field if the data inputted on a primary field doesn't match an existing one. Also, highlight the primary field if the text doesn't match that of the targeted data.
 *
 * @param {string} primaryFieldID The DOM id of the primary input field in which the primary check is performed (against the data collected using the primary field name).
 * @param {string} secondaryFieldID (Optional) The DOM id of the secondary input field in which to perform a second check is performed (against the data collected using the secondary field name).
 * @param {string} targetData The data to be checked the fields against.
 * @param {string} primaryFieldName The name of the field in the targetData used to retrieve the data to checked against the value of the primary field id.
 * @param {string} secondaryFieldName (Optional) The name of the field in the targetData used to retrieve the data to checked against the value of the secondary field.
 * @param {string} secondaryFieldDefaultValue (Optional) The default value to provide to the secondary field name.
 */
function highlightUnmatchedField(
  primaryFieldID,
  secondaryFieldID,
  targetData,
  primaryFieldName,
  secondaryFieldName,
  secondaryFieldDefaultValue
) {
  const primaryField = primaryFieldID ? document.querySelector('#' + primaryFieldID) : '';
  const secondaryField = secondaryFieldID ? document.querySelector('#' + secondaryFieldID) : '';

  ['keydown', 'input', 'change'].forEach((value, index) => {
    // If, instead of selecting, the name is typed, mimic the same behaviour to populate the user id
    primaryField.addEventListener(value, (event) => {
      let fieldVal = primaryField && primaryField.value ? primaryField.value.trim() : '';

      if (fieldVal && fieldVal.length !== 0) {
        let isValid = false;

        for (let i = 0; i < targetData.length; i++) {
          // If the provided primaryFieldName is a 2-level path (defined by using the spaced ' > ' string)
          if (primaryFieldName.includes(' > ')) {
            let primaryFieldPathElements = primaryFieldName.split(' > ');

            if (primaryFieldPathElements.length == 2) {
              let primaryFieldPath = targetData[i][primaryFieldPathElements[0]];

              for (let a = 0; a < primaryFieldPath.length; a++) {
                let selectedPrimaryFieldValue = primaryFieldPath[a][primaryFieldPathElements[1]];

                if (fieldVal.toLowerCase() == selectedPrimaryFieldValue.toLowerCase()) {
                  primaryField.value = selectedPrimaryFieldValue;

                  if (secondaryFieldName.includes(' > ')) {
                    let secondaryFieldPathElements = secondaryFieldName.split(' > ');

                    if (secondaryFieldPathElements.length == 2) {
                      let secondaryFieldPath = targetData[i][secondaryFieldPathElements[0]];
                      let selectedSecondaryFieldValue = secondaryFieldPath[a][secondaryFieldPathElements[1]];

                      primaryField.value = selectedSecondaryFieldValue;
                    }
                  } else {
                    primaryField.value = targetData[i][secondaryFieldName];
                  }

                  isValid = true;
                }
              }
            }

            // Else - e.g. if it's just a 1-level path - check the inputted string this way
          } else if (fieldVal) {
            if (fieldVal.toLowerCase() == targetData[i][primaryFieldName].toLowerCase()) {
              primaryField.value = targetData[i][primaryFieldName];

              if (secondaryField) {
                secondaryField.value = targetData[i][secondaryFieldName];
              }

              isValid = true;
            }
          }
        }

        if (!isValid) {
          if (secondaryField) {
            secondaryField.value = secondaryFieldDefaultValue;
          }

          primaryField.classList.add('alert-danger');
        } else {
          if (primaryField.classList.contains('alert-danger')) {
            primaryField.classList.remove('alert-danger');
          }
        }
      } else {
        // If the input field is empty
        if (secondaryField) {
          secondaryField.value = '';
        }

        if (primaryField.classList.contains('alert-danger')) {
          primaryField.classList.remove('alert-danger');
        }
      }
    });
  });
}

/**
 * Retrieve values from a given DOM "data-"" element.
 *
 * @param {string} dataContainerID The DOM id of the container (e.g. <div> or <span>) containing the "data-" attribute to be extracted.
 * @param {string} dataAttribute The "data-" attribute name in which data are stored.
 * @param {function} callback A callback function to be run after the data are extracted.
 */
function getData(dataContainerID, dataAttribute, callback) {
  const dataContainer = document.querySelector('#' + dataContainerID);

  let retrievedData = JSON.parse(dataContainer.getAttribute('data-' + dataAttribute));

  callback(retrievedData);
}

/**
 * Get values from a given data- element and decode them
 *
 * @param {string} dataContainerID The container from which to extract the data.
 * @param {string} dataAttribute The data- attribute name in which data are stored withing the data container.
 * @param {string} keyword The keyword used to read the encoded data.
 * @param {string} callback The function to be run once data is extracted.
 */
function getEncodedData(dataContainerID, dataAttribute, keyword, callback) {
  const dataContainer = document.querySelector('#' + dataContainerID);

  let retrievedData = dataContainer.getAttribute('data-' + dataAttribute);

  if (retrievedData && retrievedData != '') {
    let targetString = decodeURIComponent(retrievedData.replace(/^b"\\/, '').replace(/"$/, ''));

    let longKeyword = keyword.repeat(parseInt(targetString.length / keyword.length) + 1);

    let decodedChars = [];

    for (let i = 0; i < targetString.length; i++) {
      let decodedChar = String.fromCharCode(targetString.charCodeAt(i) - (longKeyword.charCodeAt(i) % 256));

      decodedChars.push(decodedChar);
    }

    let decodedDataString = decodedChars.join('');

    let processedData = JSON.parse(decodedDataString);

    callback(processedData);
  }
}

/**
 * Function to run a RESTful call.
 *
 * @param {string} url The URL use to get the data.
 * @param {string} csrfToken The CSRF Token is used to limit cross-site request forgery attempts.
 * @param {function} callback The callback function to be run once the data are retrieved.
 * @param {boolean} showOverlay Default: false. Show a loading overlay during before the call is made and after the callback is run.
 */
function getRESTfulData(url, csrfToken, callback, showOverlay = false) {
  if (showOverlay) {
    showLoadingOverlay(true);
  }

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-CSRFToken': csrfToken ? csrfToken : '',
    },
  })
    .then((response) => {
      if (!response.ok) {
        response.text().then((text) => {
          if (showOverlay) {
            showLoadingOverlay(false);
          }

          alert(text);
        });
      }

      return response.json();
    })
    .then((data) => {
      callback(data);

      if (showOverlay) {
        showLoadingOverlay(false);
      }
    })
    .catch((error) => {
      if (showOverlay) {
        showLoadingOverlay(false);
      }

      alert(error);
    });
}

/**
 * Add a loading overlay in the DOM
 *
 * @param show {boolean} If true, show the overlay, otherwise remove it.
 */
function showLoadingOverlay(show) {
  let loadingOverlay = document.querySelector('.loading-overlay');

  if (show) {
    if (!loadingOverlay) {
      const targetContainer = document.body;

      // The HTML model of the loading overlay
      const LOADING_OVERLAY_HTML = `<div class="loading-overlay d-flex flex-column justify-content-center align-items-center" style="position: fixed; width: 100%; height: 100%; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.8); z-index:1051" hidden>
                                      <div class="spinner-border align-middle" role="status" width: 3rem; height: 3rem;>
                                        <span class="sr-only">Loading...</span>
                                      </div>
                                      <div class="align-middle mt-5 px-2 py-1" style="border-radius:6px;">
                                        <strong>Patience (with somebody/something)</strong>, BrE /ˈpeɪʃns/, n., the ability to stay calm and accept a delay or something annoying without complaining. <i>Oxford Dictionary</i> 
                                      </div>               
                                    </div>`;

      // Add the overlay in the dom DOM
      targetContainer.insertAdjacentHTML('beforeend', LOADING_OVERLAY_HTML);

      loadingOverlay = document.querySelector('.loading-overlay');
    }
  } else {
    if (loadingOverlay) {
      // Dispose the loading overlay
      loadingOverlay.parentNode.removeChild(loadingOverlay);
    }
  }
}

/**
 * A click-based event to show or hide the content of a section.
 *
 * @param {string} foldingHeaderClass The DOM class of the header to be clicked to hide or show the content of the section.
 * @param {string} foldableBodyClass The DOM class of the body that will be shown or hidden when the foldable header is clicked.
 * @param {string} openSectionClass (Optional) The DOM class of the elements that identify a open section, e.g. an open folder icon, a minus logo.
 * @param {string} collapsedSectionClass (Optional) The DOM class of the elements that identify a collapsed section, e.g. a closed folder icon, a plus icon.
 */
function enableFoldableSections(foldingHeaderClass, foldableBodyClass, openSectionClass, collapsedSectionClass) {
  const foldingHeaders = document.querySelectorAll('.' + foldingHeaderClass);

  Array.from(foldingHeaders).forEach((value, index) => {
    value.style.cursor = 'pointer';
  });

  // When the report's title is clicked, show or hide its items.
  Array.from(foldingHeaders).forEach((value, index) => {
    value.addEventListener('click', (event) => {
      let headerWidth = value.offsetWidth;

      if (value.querySelector('.' + collapsedSectionClass).hidden) {
        if (openSectionClass && collapsedSectionClass) {
          Array.from(value.querySelectorAll('.' + openSectionClass)).forEach((value, index) => {
            value.hidden = true;
          });
          Array.from(value.querySelectorAll('.' + collapsedSectionClass)).forEach((value, index) => {
            value.hidden = false;
          });
        }

        Array.from(value.parentElement.querySelectorAll('.' + foldableBodyClass)).forEach((value, index) => {
          value.hidden = true;
        });

        value.style.width = headerWidth + 'px';
      } else {
        if (openSectionClass && collapsedSectionClass) {
          Array.from(value.querySelectorAll('.' + openSectionClass)).forEach((value, index) => {
            value.hidden = false;
          });
          Array.from(value.querySelectorAll('.' + collapsedSectionClass)).forEach((value, index) => {
            value.hidden = true;
          });
        }

        Array.from(value.parentElement.querySelectorAll('.' + foldableBodyClass)).forEach((value, index) => {
          value.hidden = false;
        });

        value.style.width = headerWidth + 'px';
      }
    });
  });
}

/**
 * Return the unique values from a given array
 */
Array.prototype.unique = function () {
  return this.reduce(function (previous, current, index, array) {
    previous[current.toString() + typeof current] = current;

    return array.length - 1 == index
      ? Object.keys(previous).reduce(function (prev, cur) {
          prev.push(previous[cur]);

          return prev;
        }, [])
      : previous;
  }, {});
};
