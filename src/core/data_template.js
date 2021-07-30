/**
 * Forefront Toolkit - Data Template
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as formUtilities from '../utilities/form_utilities.js';

/**
 * Generate a template with internationalised data and gender-specific data.
 *
 * @param {Object} properties A dictionary with the properties necessary to run the data template.
 * @param {function} dataPreProcessing A function to be run to allow further data processing before the document is generated.
 */
export class DataTemplate {
  constructor(properties, dataPreProcessing) {
    if (properties) {
      this.data = {};
      this.data.attribute = {};

      this.templates = {};
      this.templates.fields = {};

      this.countries = {};
      this.countries.fields = {};

      this.gender = {};
      this.genders.female = {};
      this.genders.male = {};
      this.genders.others = {};

      const data = properties.data && Object.keys(properties.data).length !== 0 ? properties.data : {};

      this.data.name = data.name ? data.name : '';

      this.data.attribute.name = data.attributeName ? data.attributeName : 'data-ft-cluster';
      this.data.attribute.value = data.attributeValue ? data.attributeValue : 'document';

      // TEMPLATES
      const templates =
        properties.templates && Object.keys(properties.templates).length !== 0 ? properties.templates : {};

      this.templates.url = templates.url ? templates.url : '';

      // TEMPLATES - FIELDS
      const templateFields = templates.fields && Object.keys(templates.fields).length !== 0 ? templates.fields : {};

      this.templates.fields.type = templateFields.type ? templateFields.type : '';

      this.templates.fields.languageISOCode = templateFields.languageISOCode ? templateFields.languageISOCode : '';
      this.templates.languageSpecific = templateFields.languageSpecific ? templateFields.languageSpecific : false;

      this.templates.fields.countryISOCode = templateFields.countryISOCode ? templateFields.countryISOCode : '';
      this.templates.fields.countryName = templateFields.countryName ? templateFields.countryName : '';
      this.templates.countrySpecific = templateFields.countrySpecific ? templateFields.countrySpecific : false;

      this.templates.fields.defaultTemplate = templateFields.defaultTemplate ? templateFields.defaultTemplate : '';

      // COUNTRIES

      const countries =
        properties.countries && Object.keys(properties.countries).length !== 0 ? properties.countries : {};

      this.countries.url = countries.url ? countries.url : '';

      // COUNTRIES - FIELDS
      const countryRef = countries.fields && Object.keys(countries.fields).length !== 0 ? countries.fields : {};

      this.countries.fields.countryISOCode = countryRef.countryISOCode ? countryRef.countryISOCode : '';

      this.countries.fields.internationalName = countryRef.internationalName ? countryRef.internationalName : '';

      this.countries.fields.namesList = countryRef.localNamesList ? countryRef.localNamesList : '';

      this.countries.fields.localName = countryRef.localName ? countryRef.localName : '';

      this.countries.fields.languageISOCode = countryRef.languageISOCode ? countryRef.languageISOCode : '';

      this.countries.fields.defaultName = countryRef.defaultName ? countryRef.defaultName : '';

      // GENDERS
      const genders = properties.genders && Object.keys(properties.genders).length !== 0 ? properties.genders : {};

      const femaleGender = genders.female && Object.keys(genders.female).length !== 0 ? genders.female : {};

      this.genders.female.value = femaleGender && femaleGender.value ? femaleGender.value : 'Female';
      this.genders.female.tag = femaleGender && femaleGender.tag ? femaleGender.tag : 'female';

      const maleGender = genders.male && Object.keys(genders.male).length !== 0 ? genders.male : {};

      this.genders.male.value = maleGender && maleGender.value ? maleGender.value : 'Male';
      this.genders.male.tag = maleGender && maleGender.tag ? maleGender.tag : 'male';

      const otherGenders = genders.other && Object.keys(genders.other).length !== 0 ? genders.other : {};

      this.genders.others.value = otherGenders && otherGenders.value ? otherGenders.value : 'Others';
      this.genders.others.tag = otherGenders && otherGenders.tag ? otherGenders.tag : 'others';

      // Function to be run to further process data collected from page.
      this.dataPreProcessing = dataPreProcessing;

      // The function that take the collected data and the template, mix them, and generates a document.
      this.documentGenerator = properties.documentGenerator ? properties.documentGenerator : null;

      // OPTIONAL FEATURES
      this.csrfToken = properties.csrfToken ? properties.csrfToken : '';
      this.alerts = properties.alerts ? properties.alerts : '';
    } else {
      throw 'Data Template Error: invalid or missing properties.';
    }
  }

  /**
   *  based on the properties of the DataTemplate.
   *
   * @param {string} countryISOCode (Country-specific docs) The Country ISO code, e.g. IT, FR, US, in capital case.
   * @param {string} languageISOCode (Language-specific docs) The Language ISO code, e.g. it, fr, en, in standard case.
   * @param {string} addresseeGender (Optional) The gender of the addressee, if any.The value depends on the
   * honorific/salutation field convention used to identify the gender, e.g. 'male'/'female', or 'm'/'f' etc...
   * @param {Object} additionalData (Optional) Data not retrieved from the DOM and added when the method is called.
   *    Syntax:
   *        [
   *          {
   *            targetFieldName: '',  {string} The field name of the record to be populated with the value.
   *            targetFieldValue: '' {string} The value to be processed and added to the document generation process.
   *          },
   *        ]
   */
  generateDocument(countryISOCode, languageISOCode, addresseeGender, additionalData) {
    if (this.alerts) {
      formUtilities.showSubmissionStatusAlert('progress', this.alerts, this.data.name, '', 'processing...');
    }

    countryISOCode = countryISOCode ? countryISOCode : '';
    languageISOCode = languageISOCode ? languageISOCode : '';
    addresseeGender = addresseeGender ? addresseeGender : '';

    let collectedData = formUtilities.getFormData(this.data.attribute.name, this.data.attribute.value);

    if (additionalData) {
      for (let i = 0; i < additionalData.length; i++) {
        collectedData[additionalData[i].targetFieldName] = additionalData[i].targetFieldValue;
      }
    }

    // Additional data processing and new fields to properly present data in the template
    if (this.dataPreProcessing && typeof this.dataPreProcessing == 'function') {
      this.data.dataPreProcessing(collectedData);
    } else if (this.dataPreProcessing && typeof this.dataPreProcessing === 'string') {
      Function('"use strict";return ' + this.dataPreProcessing)()(collectedData);
    }

    // Retrieve the template of the document, add further data and generate the related .docx file
    this.retrieveTemplate(
      this.data.name,
      countryISOCode,
      languageISOCode,
      this.templates.countrySpecific,
      this.templates.languageSpecific,
      (template) => {
        /**
         * Further fields that may be included in the properties manifest:
         * honorific: '',
         * salutation: ''.
         * fullHonorific: ''.
         * countryName: ''
         */
        const templateURL = template.templateFile ? template.templateFile : '';

        // If greetings are specified and the properties do NOT have a undefined/null/empty 'contact_gender' field.
        // Warning: any change to the templates may affect the correctness of these instructions.
        if (addresseeGender) {
          let gender = '';

          if (this.genders.female.value && addresseeGender == this.genders.female.value) {
            gender = this.genders.female.tag;
          } else if (this.genders.male.value && addresseeGender == this.genders.male.value) {
            gender = this.genders.male.tag;
          } else if (this.genders.others.value && addresseeGender == this.genders.others.value) {
            gender = this.genders.others.tag;
          }

          collectedData.honorific = template['honorific_' + gender] ? template['honorific_' + gender] : '';
          collectedData.salutation = template['salutation_' + gender] ? template['salutation_' + gender] : '';
          collectedData.fullHonorific = template['full_honorific_' + gender]
            ? template['full_honorific_' + gender]
            : '';
        }

        if (countryISOCode) {
          collectedData.countryName = template.countryName ? template.countryName : '';
        }

        // Run the third-party document processor using the collected data, the retrieved template.
        if (this.documentGenerator && typeof this.documentGenerator === 'function') {
          this.documentGenerator(collectedData, templateURL);
        } else if (this.documentGenerator && typeof this.documentGenerator === 'string') {
          Function('"use strict";return ' + this.documentGenerator)()(collectedData, templateURL);
        }

        if (this.alerts) {
          formUtilities.showSubmissionStatusAlert('success', this.alerts, this.data.name, 'succesfully', 'generated');
        }
      }
    );
  }

  /**
   * Retrieve the URL of the template URL, and allow for further actions (via a callback function).
   *
   * @param {string} templateType The name of the template, e.g. "General Document".
   * @param {string} countryISOCode (Optional) The country specified in the data template, e.g. IT, GB.
   * @param {string} languageISOCode (Optional) The language specified in the data template, e.g. it, en.
   * @param {boolean} countrySpecific If true, use the country ISO Code to look for the country-specific template.
   * @param {boolean} languageSpecific If true, use the language ISO Code to look for the language-specific template.
   * @param {function} callBackFunction A function to be run after the AJAX call is run.
   *
   * Notes:
   *  - to override the default language by not to specifying any, set the argument as empty string, i.e. '';
   *  - templateCountry and templateLanguage can be use together or separately.
   */
  retrieveTemplate(templateType, countryISOCode, languageISOCode, countrySpecific, languageSpecific, callBackFunction) {
    const templateQuery = this.templates.fields.type && templateType ? this.templates.type + '=' + templateType : '';

    // If it's a language specific template and no language is specified, English is used (i.e. en).
    const languageQuery =
      this.templates.fields.languageISOCode && languageSpecific
        ? this.templates.fields.languageISOCode + '=' + (languageISOCode || languageISOCode == '')
          ? languageISOCode
          : 'en'
        : '';

    const countryQuery =
      this.templates.fields.countryISOCode && countrySpecific && countryISOCode
        ? this.templates.fields.countryISOCode + '=' + countryISOCode
        : '';

    const query = [templateQuery, languageQuery, countryQuery].filter((query) => query);

    const url = this.templates.url + (query && query.length > 0 ? query.join('&') : '');

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-CSRFToken': this.csrfToken,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (this.alerts) {
            response.text().then((text) => {
              formUtilities.showSubmissionStatusAlert(
                'error',
                this.alerts,
                this.data.name,
                'NOT',
                'generated',
                6000,
                text
              );
            });
          }
        }

        return response.json();
      })
      .then((defaultTemplates) => {
        let templates = defaultTemplates ? defaultTemplates : '';

        // CASE A: 1 template is found.
        // Return the URL only if there is an unique template with the queried keywords
        if (templates.length > 0) {
          let url = this.countries.url + this.countries.fields.countryISOCode + '=' + countryISOCode;

          fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'X-CSRFToken': this.csrfToken,
            },
          })
            .then((response) => {
              if (!response.ok) {
                if (this.alerts) {
                  response.text().then((text) => {
                    formUtilities.showSubmissionStatusAlert(
                      'error',
                      this.alerts,
                      this.data.name,
                      'NOT',
                      'generated',
                      6000,
                      text
                    );
                  });
                }
              }

              return response.json();
            })
            .then((countries) => {
              /**
               * IF there are more than one templates, just:
               * 1) find the default local country name and language
               * 2) if exists, choose the template object and overwrite the object with that. templates = chosen template
               * 3) use the local name for the specific language
               */
              if (templates.length > 1) {
                const countryLocalNames = countries[this.countries.fields.namesList]
                  ? countries[this.countries.fields.namesList]
                  : [];

                for (let i = 0; i < countryLocalNames.length; i++) {
                  if (countryLocalNames[i][this.countries.fields.defaultName]) {
                    const countryLanguageCode = countryLocalNames[i][this.countries.fields.languageISOCode];

                    for (let a = 0; a < templates.length; a++) {
                      if (templates[a][this.templates.fields.languageISOCode] == countryLanguageCode) {
                        templates = templates[a];

                        break;
                      }
                    }
                  }
                }
              }

              // Note: A country MUST BE specified in order to set the proper country name!
              if (countries.length == 1) {
                const template = defaultTemplates[0] ? defaultTemplates[0] : '';

                let countryName = '';

                const countryLocalNames = countries[0][this.countries.fields.namesList]
                  ? countries[0][this.countries.fields.namesList]
                  : [];

                // Case 1: Multilingual Country AND Language-specific Template. Use language-specific LOCAL COUNTRY NAME.
                if (languageSpecific) {
                  for (let i = 0; i < countryLocalNames.length; i++) {
                    if (countryLocalNames[i][this.countries.fields.languageISOCode] == languageISOCode) {
                      countryName = countryLocalNames[i][this.countries.fields.localName];
                    }
                  }

                  countryName = countryName ? countryName : countries[0][this.countries.fields.internationalName];

                  // Case 2: NO Language-specific Template. Use the INTERNATIONAL COUNTRY NAME.
                } else {
                  countryName = countries[0][this.countries.fields.internationalName];
                }

                template.countryName = countryName;

                callBackFunction(template);
              }
            })
            .catch((error) => {
              if (this.alerts) {
                formUtilities.showSubmissionStatusAlert(
                  'error',
                  this.alerts,
                  this.data.name,
                  'NOT',
                  'generated',
                  6000,
                  error
                );
              }
            });

          // CASE C: NO templates are found. Use the default template and the international country name.
        } else if (templates.length == 0) {
          // If no match is found, find the default template (the template with  set to true).
          const templatesQuery =
            this.templates.fields.type && templateType ? this.templates.fields.type + '=' + templateType : '';

          const defaultTemplateQuery = this.templates.fields.defaultTemplate
            ? this.templates.fields.defaultTemplate + '=true'
            : '';

          const query = [templatesQuery, defaultTemplateQuery].filter((query) => query);

          const url = this.templates.url + (query && query.length > 0 ? query.join('&') : '');

          fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'X-CSRFToken': this.csrfToken,
            },
          })
            .then((response) => {
              if (!response.ok) {
                if (this.alerts) {
                  response.text().then((text) => {
                    formUtilities.showSubmissionStatusAlert(
                      'error',
                      this.alerts,
                      this.data.name,
                      'NOT',
                      'generated',
                      6000,
                      text
                    );
                  });
                }
              }

              return response.json();
            })
            .then((defaultTemplates) => {
              if (defaultTemplates.length == 1) {
                const template = defaultTemplates[0] ? defaultTemplates[0] : '';

                if (countryISOCode) {
                  const url = this.countries.url + this.countries.fields.countryISOCode + '=' + countryISOCode;

                  fetch(url, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json; charset=utf-8',
                      'X-CSRFToken': this.csrfToken,
                    },
                  })
                    .then((response) => {
                      if (!response.ok) {
                        if (this.alerts) {
                          response.text().then((text) => {
                            formUtilities.showSubmissionStatusAlert(
                              'error',
                              this.alerts,
                              this.data.name,
                              'NOT',
                              'generated',
                              6000,
                              text
                            );
                          });
                        }
                      }

                      return response.json();
                    })
                    .then((countries) => {
                      if (countries.length == 1) {
                        template[this.templates.fields.countryISOCode] =
                          countries[0][this.countries.fields.countryISOCode];
                        template[this.templates.fields.countryName] =
                          countries[0][this.countries.fields.internationalName];

                        callBackFunction(template);
                      }
                    })
                    .catch((error) => {
                      if (this.alerts) {
                        formUtilities.showSubmissionStatusAlert(
                          'error',
                          this.alerts,
                          this.data.name,
                          'NOT',
                          'generated',
                          6000,
                          error
                        );
                      }
                    });
                }
              }
            })
            .catch((error) => {
              if (this.alerts) {
                formUtilities.showSubmissionStatusAlert(
                  'error',
                  this.alerts,
                  this.data.name,
                  'NOT',
                  'generated',
                  6000,
                  error
                );
              }
            });
        }
      })
      .catch((error) => {
        if (this.alerts) {
          formUtilities.showSubmissionStatusAlert(
            'error',
            this.alerts,
            this.data.name,
            'NOT',
            'generated',
            6000,
            error
          );
        }
      });
  }
}
