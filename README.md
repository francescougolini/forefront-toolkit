# Forefront Toolkit

A set of tools and utilities designed to help handle data entry and data processing tasks.

**Warning:** Forefront Toolkit is in its early stage of development and is **NOT** ready for production.

Forefront Toolkit is released under the **Mozilla Public License, v. 2.0**. Please, read the [LICENSE](LICENSE) before using it.

## Table of Content

1. [Fetcher](#fetcher)
2. [Table](#table)
3. [FilterSet](#filterset)
4. [Data Processor](#data-processor)
5. [Data Collection](#data-collection)
6. [Notebook](#notebook)
7. [Data Template](#data-template)
8. [EntrySet](#entryset)
9. [Utilities](#utilities)
10. [Dependencies](#dependencies)
11. [Disclaimer](#disclaimer)
12. [Copyright](#copyright)

## Fetcher

A class that allows to initialise a table and a filterset, retrieve the query, run it, and return the data in the table.

It also offers a toolbox container to display information (e.g. records loaded), load more records and other tools from the other elements (if any).

### Properties

| Level 0            | Level 1        | Type            | Default | Description                                                                                                |                                                                                              |
| :----------------- | :------------- | :-------------- | :------ | :--------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `httpRequest` {}   | ---            |                 |         |                                                                                                            |                                                                                              |
| ---                | `getURL`       | string          | ''      | The URL to fetch the (raw) data.                                                                           |                                                                                              |
| ---                | `csrfToken`    | string          | ''      | The token used to protect from cross-site request forgery.                                                 |                                                                                              |
| ---                | `runAtStartup` | boolean         | false   | Run the default query - i.e. the one defined by properties, when a new Fetcher is created and initialised. |                                                                                              |
| `pagination`       | ---            | ---             |         |                                                                                                            | Recover data progressively.                                                                  |
| ---                | `batch`        | ---             | number  |                                                                                                            | If the API provides it, The number of records to be loaded per time.                         |
| ---                | `pageField`    | ---             | string  |                                                                                                            | If the API provides it, the field to be used in building the URL to retrieve the page.       |
| ---                | `batchField`   | ---             | string  |                                                                                                            | If the API provides it, the field to be used in building the URL to retrieve the batch.      |
| ---                | `startField`   | ---             | string  |                                                                                                            | If the API provides it, the field to be used in specifying the first result to be requested. |
| ---                | `endField`     | ---             | string  |                                                                                                            | If the API provides it, the field to be used in specifying the last result to be requested.  |
| `triggerChange`    | ---            | boolean         | false   | Ensure a 'change' event is triggered.                                                                      |                                                                                              |
| `table`            | ---            | object          | null    | The properties manifest of the Table object.                                                               |                                                                                              |
| `filterSet`        | ---            | object          | null    | The properties manifest of the FilterSet object.                                                           |                                                                                              |
| `customBackend`    | ---            | function/string | null    | Override the normal table generation with custom data requesting/processing                                |                                                                                              |
| `customProcessing` | ---            | function/string | null    | Process the retrieved data before they are passed to the Table.                                            |                                                                                              |
| `statusSnippet`    | ---            | string          | ''      | The value of the 'data-ft-status-snippet' attribute, used to identify the container of the status snippet. |                                                                                              |

### Class and Methods

| Class                   | Method         | Attributes | Details | Return |
| :---------------------- | :------------- | :--------- | ------- | :----- |
| `Fetcher(`properties`)` | ---            | ---        | ---     |        |
| ---                     | `initialise()` | ---        | ---     |        |

## Table

A table in which data are displayed according to a set of pre-defined criteria and in-table filters. It also provides conditional formatting and custom post-processing of data.

### Properties

| Level 0                    | Level 1        | Level 2            | Type            | Default          | Description                                                                                                     |
| :------------------------- | :------------- | :----------------- | :-------------- | :--------------- | :-------------------------------------------------------------------------------------------------------------- |
| `pointOfEntry`             | ---            | ---                | string          |                  | The ID of the DOM element in which the table will be added.                                                     |
| `striped`                  | ---            | ---                | boolean         | true             | Show rows in alternate colours.                                                                                 |
| `mode`                     | ---            | ---                | string          | 'standard'       | Options: 'standard' (horizontal scroll), 'sticky' (sticky header), 'viewport' (horizontal and vertical scroll). |
| `export`                   | ---            | ---                | string          | 'disabled'       | Options: 'safe' (remove the HTML tags from the exported data), 'raw', 'disabled'.                               |
| `columns` []               | ---            | ---                |                 |                  |                                                                                                                 |
| ---                        | `label`        | ---                | string          | ''               | The name to be shown on the table's header.                                                                     |
| ---                        | `sourceField`  | ---                | string          |                  | The field name from which to extract the data.                                                                  |
| ---                        | `dataType`     | ---                | string          | 'text'           | Options: 'text', 'number', 'eu_date', 'iso_date'.                                                               |
| ---                        | `cellType`     | ---                | string          | 'text'           | Options: 'text', 'eu_date', 'tick', 'tick_plain', 'link', 'button'.                                             |
| ---                        | `visible`      | ---                | boolean         | true             | Create the column or keep it as a data (e.g. for further processing).                                           |
| ---                        | `sorting`      | ---                | boolean         | true             | Show a sorting button (sort ascending/descending).                                                              |
| ---                        | `filtering`    | ---                | string          | 'none'           | Options: 'open', 'select', 'none'.                                                                              |
| ---                        | `defaultOrder` | ---                | string          | 'none'           | Options: 'ascending'/'asc', 'descending'/'desc', 'none'.                                                        |
| ---                        | `link` {}      | ---                | array           |                  | **ONLY** for columns with cellType 'link'.                                                                      |
| ---                        | ---            | `type`             | string          | 'standard'       | Options: 'standard', 'plain', 'button'.                                                                         |
| ---                        | ---            | `title`            | string          | 'Link'           |                                                                                                                 |
| ---                        | ---            | `label`            | string          | defaultURL value |                                                                                                                 |
| ---                        | ---            | `defaultURL`       | string          | cell value       |                                                                                                                 |
| ---                        | ---            | `refDataField`     | string          | ''               |                                                                                                                 |
| ---                        | ---            | `inPageLink`       | string          | ''               | The in-page link.                                                                                               |
| ---                        | ---            | `externalLinkMark` | boolean         | false            |                                                                                                                 |
| ---                        | ---            | `targetBlank`      | boolean         | true             |                                                                                                                 |
| `conditionalFormatting` [] | ---            | ---                |                 |                  |                                                                                                                 |
| ---                        | `target`       | ---                | string          |                  | The type of target in which to apply the conditional filter. Options: 'row', 'cell'.                            |
| ---                        | `columns`      | ---                | string/array    |                  | The column or the columns in which to check the condition.                                                      |
| ---                        | `condition`    | ---                | string          | 'includes'       | The condition to verify. Options: 'includes', '>','<','>=','<=','==','!=','===','==='.                          |
| ---                        | `values`       | ---                | string/array    |                  | The value or values to check against the targeted cells.                                                        |
| ---                        | `format`       | ---                | string/array    | true             | Create the column or keep it as a data (e.g. for further processing).                                           |
| `customPostProcessing`     | ---            | ---                | function/string |                  | The DOM classes to apply if the condition is met.                                                               |

### Class and Methods

| Class                 | Method           | Attributes    | Details                                                                          | Return |
| :-------------------- | :--------------- | :------------ | -------------------------------------------------------------------------------- | :----- |
| `Table(`properties`)` | ---              | ---           | ---                                                                              |        |
| ---                   | `createTable()`  | ---           | ---                                                                              |        |
| ---                   |                  | {Object} data | The key-value-based object representing the records to be included in the table. |        |
| ---                   | `refreshTable()` | ---           | ---                                                                              |        |
| ---                   | `resetTable()`   | ---           | ---                                                                              |        |
| ---                   | `appendRows()`   | [Object] data | An array of arrays representing the rows to be appended.                         |        |

## FilterSet

A filterset is a UI element that allows to build complex queries using different types of toggles and filters.

### Properties

| Level 0              | Level 1           | Level 2        | Level 3   | Type    | Default              | Description                                                                                                                                                                                  |
| :------------------- | :---------------- | :------------- | :-------- | :------ | :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pointOfEntry`       | ---               | ---            | ---       | string  | ''                   | The ID of the DOM element in which the filterSet module will be added.                                                                                                                       |
| `openSearch`         | ---               | ---            | ---       | string  | undefined            | Display the open search field, and use the string as query keyword.                                                                                                                          |
| `dateRange`          | ---               | ---            | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | `visible`         | ---            | ---       | boolean | false                | Show the date-range filter.                                                                                                                                                                  |
| ---                  | `date` {}         | ---            | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | `start`        | ---       | string  |                      | The keyword used to filter by start date.                                                                                                                                                    |
| ---                  | ---               | `end`          | ---       | string  |                      | The keyword used to filter by end date.                                                                                                                                                      |
| ---                  | `time` {}         | ---            | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | `start`        | ---       | string  |                      | The keyword used to filter by start time.                                                                                                                                                    |
| ---                  | ---               | `end`          | ---       | string  |                      | The keyword used to filter by end time.                                                                                                                                                      |
| ---                  | ---               | `coupling`     | ---       | boolean | false                | if true, couple the date and time without the '&' character.                                                                                                                                 |
| ---                  | `toggles` {}      | ---            | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | `today`        | ---       | boolean | false                | Enable the "today" toggle button in the date range filter.                                                                                                                                   |
| ---                  | ---               | `thisWeek`     | ---       | boolean | false                | Enable the "this week" toggle button in the date range filter.                                                                                                                               |
| ---                  | ---               | `thisMonth`    | ---       | boolean | false                | Enable the "this month" toggle button in the date range filter.                                                                                                                              |
| ---                  | ---               | `thisYear`     | ---       | boolean | false                | Enable the "this year" toggle button in the date range filter.                                                                                                                               |
| `customFilters` []   | ---               | ---            | ---       | array   |                      |                                                                                                                                                                                              |
| ---                  | `name`            | ---            | ---       | string  | ''                   | The name of the FilterSet, also shown in the filterset controls.                                                                                                                             |
| ---                  | `icon`            | ---            | ---       | string  | 'fa-bars'            | The FA icon name to be displayed alongside the name in the FilterSet controls.                                                                                                               |
| ---                  | `class`           | ---            | ---       | string  | ''                   | The DOM Class used to identify filters.                                                                                                                                                      |
| ---                  | `switchToggles`   | ---            | ---       | boolean |                      | If present, filter buttons will act as radio buttons.                                                                                                                                        |
| ---                  | `join`            | ---            | ---       | string  |                      | If defined and switchToggles is not enable, join the values in a single string, otherwise keep multiple keyword=value queries.                                                               |
| ---                  | `filters` {}      | ---            | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | `name`         | ---       | string  | ''                   | The name of the filter.                                                                                                                                                                      |
| ---                  | ---               | `targetField`  | ---       | string  | ''                   | The JSON key of the filter.                                                                                                                                                                  |
| ---                  | ---               | `sourceValue`  | ---       | string  | ''                   | The default JSON value to be used as filter.                                                                                                                                                 |
| ---                  | ---               | `color`        | ---       | string  | customColors.toggles | If defined, the bootstrap class-based colour (e.g. warning, danger, success). Default if 'secondary'.                                                                                        |
| `sorting` {}         | ---               | ---            | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | `fields` []       | ---            | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | `label`        | ---       | string  |                      | The (visible) label of the field to be sorted.                                                                                                                                               |
| ---                  | ---               | `targetField`  | ---       | string  |                      | The field name used to run the sorting query.                                                                                                                                                |
| ---                  | `keywords` []     | ---            | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | `type`         | ---       | string  |                      | If only one keyword is required, use 'generic'. Otherwise, if the order is dealt with two keywords, use 'ascending' and 'descending' (in this case, both are required).                      |
| ---                  | ---               | `keyword`      | ---       | string  |                      | The keyword used in the query to receive records in the requested order.                                                                                                                     |
| ---                  | `join`            | ---            | ---       | string  |                      | If defined, join the values for each order in a single string, otherwise keep multiple keyword=value queries.                                                                                |
| ---                  | `badgeColor`      | ---            | ---       | string  | 'badge-light'        | The DOM class representing the colour of the snippet.                                                                                                                                        |
| `advancedOptions` {} | ---               | ---            | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | `queryPresets` {} | ---            | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | `timeSpan` {}  |           |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | ---            | `default` | string  | ''                   | If no custom date range is defined, filter all the queries according to the defined option: 'thisYear', 'thisMonth', 'thisWeek', 'today', 'thisYearSoFar', 'daySpan' + days (e.g. daySpan3). |
| ---                  | ---               | ---            | `initial` | string  | ''                   | Filter the initial query according to the defined option: 'thisYear', 'thisMonth', 'thisWeek', 'today', 'thisYearSoFar', 'daySpan' + days (e.g. daySpan3).                                   |
| ---                  | ---               | `date`{}       | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | ---            | `start`   | string  |                      | Format: YYYY-MM-DD. The start date value to be set by default in the query.                                                                                                                  |
| ---                  | ---               | ---            | `end`     | string  |                      | Format: YYYY-MM-DD. The end date value to be set by default in the query.                                                                                                                    |
| ---                  | ---               | `time` {}      | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | ---            | `start`   | string  |                      | Format: HH:mm. The start time value to be set by default in the query.                                                                                                                       |
| ---                  | ---               | ---            | `end`     | string  |                      | Format: HH:mm. The start time value to be set by default in the query.                                                                                                                       |
| ---                  | ---               | `custom` []    | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | ---            | `type`    | string  | 'default'            | Options: 'initial' (run only at table initialisation), 'default' (include it every time a query is made).                                                                                    |
| ---                  | ---               | ---            | `keyword` | string  | ''                   | The left side of the query (custom_keyword=custom_value).                                                                                                                                    |
| ---                  | ---               | ---            | `value`   | string  | ''                   | The right side of the query (custom_keyword=custom_value).                                                                                                                                   |
| ---                  | `customColors` {} | ---            | ---       |         |                      |                                                                                                                                                                                              |
| ---                  | ---               | `controls`     | ---       | string  | 'outline-secondary'  | The bootstrap class-based colour to be used as default colour for the controls of the FilterSet.                                                                                             |
| ---                  | ---               | `toggles`      | ---       | string  | 'outline-secondary'  | The bootstrap class-based colour to be used as default colour for the toggles of the FilterSet.                                                                                              |
| ---                  | ---               | `searchButton` | ---       | string  | 'primary'            | The bootstrap class-based colour to be used as default colour for the search button of the FilterSet.                                                                                        |

NOTE: In-table sorting follows the order of the columns, therefore the sorting criteria should be read from right to left.

### Class and Methods

| Class                     | Method              | Attributes | Details | Return |
| :------------------------ | :------------------ | :--------- | ------- | :----- |
| `Filterset(`properties`)` | ---                 | ---        | ---     |        |
| ---                       | `initialise()`      | ---        | ---     |        |
| ---                       | `getSearchButton()` | ---        | ---     |        |

## Data Processor

A data processor allow to retrieve data from the DOM by using data- attributes and a data model defined in the class constructor.

This class allows to leverage form inputs and Rest APIs to provide a bespoke data entry experience.

### Attributes

#### General

- **data-ft-cluster**: The cluster of data to be processed and retrieved. One or more clusters can be provided. E.g. data-ft-cluster:"company-details person-details".

- **data-ft-field-type**: The custom type of the field. Only one field-type can be provided.

  - Can be:
    - `text`: a standard text input field
    - `textarea`: a standard textarea input field
    - `tel`: an input field that has to start with an international dialling code and followed by two decimals, e.g. +41, +39.
    - `number`: an input field containing only numbers.
    - `date`: an input field that has to follow the DD/MM/YYYY formatting.
    - `select`: a standard select input field, from which only the `value` is extracted.
    - `select-open-choice`: a select input field from which both the `value` and the `textContent` is extracted, and with a `data-ft-other-option-field` and a related text input field,
    - `select-closed-choice`: a select input field with a closed set of choices from which both the `value` and the `textContent` is extracted.
    - `checkbox`: a standard textbox
    - `checkbox-labelled`: a checkbox input field from which, along with the `checked` status, the label's `textContent` is extracted.

- **data-ft-source-field**: (Optional) The field name used to retrieve/transmit the data contained in the input field. Only one source-field can be provided.

- **data-ft-empty-value-tag**: (Optional) The value used to identify a set of fields to be filled with standard values. This information will be used to post-process extracted data and make sure no errors occur if they are left empty. To be used jointly with `ft.setEmptyValues()`.

#### Checkbox Labelled

- **data-ft-text-source-field**: the field used to retrieve/transmit the label of the checkbox.

#### Checkbox group

- **data-ft-checbox-group-label**: the label used to jointly identify and name a group of checkboxes. To be used in a input field (visible or hidden).
- **data-ft-checkbox-group**: used to identify a group of checkboxes to be jointly validated. To be used in each `type="checkbox"` input field and in the input field containing the label/name of the group.

#### Select Open Choice

- **data-ft-text-source-field**: the field used to retrieve/transmit the inputted text after the "other" option is selected.
- **data-ft-other-option-field**: (`true` or `false`) This attribute identifies which `<option>` DOM attribute is the "other option".
- **data-ft-other-option-field-id**: the DOM `id` of the input field from which to extract the content of the defined other open (manually inputted) option.

#### Select Closed Choice

- **data-ft-text-source-field**: the field used to retrieve/transmit the label of the checkbox.

#### Date

- **data-ft-set-today-date**: (`true` or `false`) If true, on page load, set the `date` field to today's date.

- **data-ft-start-date**: Used for validating start/end date group fields. The value used to identify the start date and the end date fields. Note: `data-ft-end-date` must be defined for the validation to work.
- **data-ft-end-date**: Used for validating start/end date group fields. The value used to identify the start date and the end date fields. Note: `data-ft-start-date` must be defined for the validation to work.

#### Buttons

- **data-ft-button-create**: a string used to identify the DOM element/s in which the creation (POST) button will be added.
- **data-ft-button-update**: a string used to identify the DOM element/s in which the update (PUT) button will be added.

#### DOM Data Store

- **data-ft-store**: a string used to identify the element containing the `data-` attributes with the data to be retrieved. A page can have one data-ft-store attribute per processor. Use `data-` in the same element to identify different data types.

### Class and Methods

| Class                         | Method             | Attributes           | Details                                                                                     | Return |
| :---------------------------- | :----------------- | :------------------- | ------------------------------------------------------------------------------------------- | :----- |
| `DataProcessor(`properties`)` | ---                | ---                  | ---                                                                                         |        |
| ---                           | `processRequest()` | ---                  | ---                                                                                         |        |
| ---                           |                    | {string} requestType | The type of HTTP request to be performed. Options: 'POST', 'PUT', 'GET'.                    |        |
| ---                           | ---                | {boolean} redirect   | Redirect to another page once the processing is done.                                       |        |
| ---                           | `onButtonClick()`  | ---                  | ---                                                                                         |        |
| ---                           | ---                | requestType          | The type of HTTP request to be performed. Options: 'POST', 'PUT', 'GET'.                    |        |
| ---                           | ---                | {boolean} redirect   | Redirect to another page once the processing is done.                                       |        |
| ---                           | ---                | {function} callback  | Parameters: dataProcessing (the function to be called to process the data in the callback). |        |

### Properties

| Level 0         | Level 1          | Level 2       | Level 3         | Type            | Default           | Description                                                                                                    |
| :-------------- | :--------------- | :------------ | :-------------- | :-------------- | :---------------- | :------------------------------------------------------------------------------------------------------------- |
| `cluster` {}    | ---              | ---           | ---             |                 |                   |                                                                                                                |
| ---             | `name`           | ---           | ---             | string          | 'Data Cluster'    | The human-friendly name of the cluster.                                                                        |
| ---             | `attributeName`  | ---           | ---             | string          | 'data-ft-cluster' | The attribute of the DOM "data-" attribute used to identify the elements to processed.                         |
| ---             | `attributeValue` | ---           | ---             | string          | ''                | The value of the DOM "data-" attribute used to identify the elements to processed.                             |
| `data` {}       | ---              | ---           | ---             |                 |                   |                                                                                                                |
| ---             | `get` {}         | ---           | ---             |                 |                   |                                                                                                                |
| ---             | ---              | `url`         | ---             | string          |                   | The URL for the HTTP GET request.                                                                              |
| ---             | ---              | `dom` {}      | ---             |                 |                   |                                                                                                                |
| ---             | ---              | ---           | `containerID`   | string          | ''                | The DOM element containing the data to be retrieved.                                                           |
| ---             | ---              | ---           | `attributeName` | string          | ''                | The DOM "data-" attribute in which data are stored.                                                            |
| ---             | ---              | ---           | `key`           | string          | ''                | **ONLY** for encoded DOM data requests. The encoding key to read the data stored in the DOM.                   |
| ---             | ---              | `multi`       | ---             | boolean         | false             | If true, records are not processed. Use `postProcessing` to use the retrieved data.                            |
| ---             | `post` {}        | ---           | ---             |                 |                   |                                                                                                                |
| ---             | ---              | `url`         | ---             | string          | ''                | The URL for the HTTP POST/Create request.                                                                      |
| ---             | ---              | `button`      | ---             | string          | ''                | The DOM class of the create button.                                                                            |
| ---             | ---              | `response` {} | ---             |                 |                   |                                                                                                                |
| ---             | ---              | ---           | `urlPath`       | string          | ''                | The path used to route the user to a new page on a successful POST/Create request.                             |
| ---             | ---              | ---           | `uidFieldName`  | string          | ''                | The name of the field used to store the newly created record after a POST/Create request.                      |
| ---             | ---              | ---           | `uidValue`      | string          | ''                | The ID of the record. For POST requests, this is populated after the POST/Create request is successful.        |
| ---             | `put` {}         | ---           | ---             |                 |                   |                                                                                                                |
| ---             | ---              | `url`         | ---             | string          | ''                | The URL for the HTTP PUT/Update request.                                                                       |
| ---             | ---              | `button`      | ---             | string          | ''                | The DOM class of the update button.                                                                            |
| ---             | `delete` {}      | ---           | ---             |                 |                   |                                                                                                                |
| ---             | ---              | `url`         | ---             | string          | ''                | The URL for the HTTP DELETE request.                                                                           |
| ---             | ---              | `button`      | ---             | string          | ''                | The DOM class of the update button.                                                                            |
| ---             | `csrfToken`      | ---           | ---             | string          | ''                | The token used to protect from cross-site request forgery.                                                     |
| ---             | `cache`          | ---           | ---             | boolean         | ''                | If true, add an element to the dataCache object - named after the "cluster name" - to collect the cached data. |
| ---             | `preProcessing`  | ---           | ---             | function/string | null              | Parameters: data retrieved from the DOM. Actions to be run when data are collected/processed.                  |
| ---             | `postProcessing` | ---           | ---             | function/string | null              | Parameters: data returned from the HTTP GET request. Action to be run when the GET action is run.              |
| `alerts`        | ---              | ---           | ---             | string          | ''                | The value of the 'data-ft-alerts' attribute used to identify the container in which to insert the alert boxes. |
| `statusSnippet` | ---              | ---           | ---             | string          | ''                | The value of the 'data-ft-status-snippet' used to identify the container of the status snippet.                |
| `notebook`      | ---              | ---           | ---             | object          |                   | The name of the Object containing the properties of the notebook, e.g. to store comments.                      |
| `redirect` {}   | ---              | ---           | ---             |                 |                   |                                                                                                                |
| ---             | `url`            | ---           | ---             | string          | ''                | The URL of the new page to be open after a successful POST or PUT operation.                                   |
| ---             | `dynamicPath`    | ---           | ---             | string          | ''                | The DOM id of the element containing the path to be appended to the URL, e.g. a UID.                           |
| ---             | `blankPage`      | ---           | ---             | boolean         | false             | Open the new page in a new window/tab.                                                                         |

## Data Collection

A Data Collection is a set of variables represented as records. Each collection is formed by one or more records. This class allows to easily process data by creating a quick way to retrieve and process them.

### Data Model - Variables

| Level 0 | Level 1        | Type   | Default            | Description                                              |
| :------ | :------------- | :----- | :----------------- | :------------------------------------------------------- |
| []      | ---            |        |                    |                                                          |
| ---     | `uid`          | string | 'var*uid*' + index | A unique identifier for the variable.                    |
| ---     | `sourceField`  | string |                    | The field name from which to extract the data.           |
| ---     | `dataType`     | string | 'text'             | Options: 'text', 'number', 'eu_date', 'iso_date'.        |
| ---     | `defaultOrder` | string | 'none'             | Options: 'ascending'/'asc', 'descending'/'desc', 'none'. |

## Notebook

A notebook is a list of data that relates to a specific action.

For example, when producing a story, there might be different activities takes, such as interviews.

### Properties

| Level 0        | Level 1          | Level 2         | Type            | Default           | Description                                                                                                                                                                      |
| :------------- | :--------------- | :-------------- | :-------------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pointOfEntry` | ---              | ---             | string          |                   | The container in which to insert and (then) display the table with the notes.                                                                                                    |
| `notebook` {}  | ---              | ---             |                 |                   |                                                                                                                                                                                  |
| ---            | `name`           | ---             | string          | 'Notebook'        | The human-friendly name of the notebook.                                                                                                                                         |
| ---            | `attributeName`  | ---             | string          | 'data-ft-cluster' | The name of the DOM "data-" attribute used to identify the elements to be added in the notebook.                                                                                 |
| ---            | `attributeValue` | ---             | string          | 'notebook'        | The value of the DOM "data-" attribute used to identify the elements to be added in the notebook.                                                                                |
| `sections` {}  | ---              | ---             |                 |                   |                                                                                                                                                                                  |
| ---            | `label`          | ---             | string          | ''                | The label to be shown in the column containing the data of the field.                                                                                                            |
| ---            | `fields` {}      | ---             |                 |                   |                                                                                                                                                                                  |
| ---            | ---              | `section`       | string          | ''                | The field name of the section.                                                                                                                                                   |
| ---            | ---              | `dataSource`    | string          | ''                | The field name of the value to be added in the note. Advanced options:                                                                                                           |
| ---            | ---              | ---             |                 |                   | - `__dynamic_var__` (a process generated value, the object field is defined in the altDataSourceField);                                                                          |
| ---            | ---              | ---             |                 |                   | - `__static_var__` (a value contained in the initial DOM, the variable is defined in the altDataSourceField);                                                                    |
| ---            | ---              | ---             |                 |                   | - `__default_value__` (a give value is defined in the properties);                                                                                                               |
| ---            | ---              | ---             |                 |                   | - `__generated__` (the field is populated at back-end level, e.g. timestamps).                                                                                                   |
| ---            | ---              | `altDataSource` | string          | ''                | If `__dynamic_var__` is defined, the name of the field (string) from which to retrieve the value. If `__static_var__` is defined, the variable from which to retrieve the value. |
| ---            | `visible`        | ---             | boolean         | true              | Show the section in the notebook.                                                                                                                                                |
| ---            | `type`           | ---             | string          | 'text'            | The type of the section. Options: 'text', 'datetime'.                                                                                                                            |
| ---            | `order`          | ---             | number          | Infinity          | The order to display the section.                                                                                                                                                |
| `data` {}      | ---              | ---             |                 |                   |                                                                                                                                                                                  |
| ---            | `getURL`         | ---             | string          | ''                | The URL to perform the GET request.                                                                                                                                              |
| ---            | `postURL`        | ---             | string          | ''                | The URL to perform the POST request.                                                                                                                                             |
| ---            | `csrfToken`      | ---             | string          | ''                | The token used to protect from cross-site request forgery.                                                                                                                       |
| ---            | `postProcessing` | ---             | function/string | null              | Parameters: requestType, notes. Custom instruction to manipulate the note/s.                                                                                                     |

## Data Template

Whether it's a receipt or an interview form, there are documents that require multiple repetitive actions to be dealt with. This class allows to create a data model to collect data from a page, optionally adding extra later, retrieve a template, and generate a document.

While this class doesn't provide a document generator, it allows to include it directly. It also allows to define country and/or language specific data and templates.

### Properties

| Level 0             | Level 1          | Level 2             | Type            | Default           | Description                                                                                                    |
| :------------------ | :--------------- | :------------------ | :-------------- | :---------------- | :------------------------------------------------------------------------------------------------------------- |
| `data`{}            | ---              | ---                 |                 |                   |                                                                                                                |
| ---                 | `name`           | ---                 | string          | ''                | The name of the document.                                                                                      |
| ---                 | `attributeName`  | ---                 | string          | 'data-ft-cluster' | The DOM "data-" attribute used to identify the fields in the HTML page.                                        |
| ---                 | `attributeValue` | ---                 | string          | 'document'        | The value of the DOM "data-" attribute used to identify the elements to be added in the document.              |
| `templates` {}      | ---              | ---                 |                 |                   |                                                                                                                |
| ---                 | `url`            | ---                 | string          | ''                | The URL to fetch the template/s of the document.                                                               |
| ---                 | `fields` {}      | ---                 |                 |                   |                                                                                                                |
| ---                 | ---              | `type`              | string          | ''                | The name of the field containing the "standardised" type of the template, such as interview forms or receipts. |
| ---                 | ---              | `languageISOCode`   | string          | ''                | The name of the field containing the ISO code of the language to retrieve the related template.                |
| ---                 | ---              | `languageSpecific`  | boolean         | false             | If true, retrieve the template using the ISO code of the language.                                             |
| ---                 | ---              | `countryISOCode`    | string          | ''                | The name of the field containing the ISO code of the country to retrieve the related template.                 |
| ---                 | ---              | `countryName`       | string          | ''                | The name of the field containing the country name to be used inside the template.                              |
| ---                 | ---              | `countrySpecific`   | boolean         | false             | If true, retrieve the template using the ISO code of the country.                                              |
| ---                 | ---              | `defaultTemplate`   | string          | ''                | The name of the (boolean) field used to identify the default template.                                         |
| `countries` {}      | ---              | ---                 |                 |                   |                                                                                                                |
| ---                 | `url`            | ---                 | string          | ''                | The URL to fetch the list of countries.                                                                        |
| ---                 | `fields` {}      | ---                 |                 |                   |                                                                                                                |
| ---                 | ---              | `countryISOCode`    | string          | ''                | The name of the field containing ISO code of the country.                                                      |
| ---                 | ---              | `internationalName` | string          | ''                | The name of the field containing the international (English) name of the country.                              |
| ---                 | ---              | `localNamesList`    | string          | ''                | The name of the field containing the list of country local names, e.g. Belgium and Switzerland.                |
| ---                 | ---              | `localName`         | string          | ''                | The name of field containing the local name of the country (a child of localNamesList).                        |
| ---                 | ---              | `defaultName`       | string          | ''                | The name of the (boolean) field used to identify the default country name (if there are multiple local names). |
| ---                 | ---              | `languageISOCode`   | string          | ''                | The name of the field containing the ISO code of the language in order to retrieve the local country name.     |
| `genders` {}        | ---              | ---                 |                 |                   |                                                                                                                |
| ---                 | `female` {}      | ---                 |                 |                   |                                                                                                                |
| ---                 | ---              | `value`             | string          | 'Female'          | The term used to identify the feminine gender.                                                                 |
| ---                 | ---              | `tag`               | string          | 'female'          | The tag to be used to identify the feminine gender in other fields/elements (e.g. honorific, salutation).      |
| ---                 | `male` {}        | ---                 |                 |                   |                                                                                                                |
| ---                 | ---              | `value`             | string          | 'Male'            | The term used to identify the masculine gender.                                                                |
| ---                 | ---              | `tag`               | string          | 'male'            | The tag to be used to identify the masculine gender in other fields/elements (e.g. honorific, salutation).     |
| ---                 | `others` {}      | ---                 |                 |                   |                                                                                                                |
| ---                 | ---              | `value`             | string          | 'Others'          | The term used to identify other genders.                                                                       |
| ---                 | ---              | `tag`               | string          | 'others'          | The tag to be used to identify other genders in other fields/elements (e.g. honorific, salutation).            |
| `documentGenerator` | ---              | ---                 | function/string | null              | The function to be run to generate the document using the collected data and the retrieved template.           |
| `csrfToken`         | ---              | ---                 | string          | ''                | The token used to protect from cross-site request forgery.                                                     |
| `alerts`            | ---              | ---                 | string          | ''                | The 'data-ft-alerts' attribute used to identify the container in which to insert the alert boxes.              |

## EntrySet

Sometimes you need to use a form multiple time. An entryset allows creating multiple forms in the same page.

### Properties

| Level 0        | Level 1              | Level 2          | Type   | Default               | Description                                                                                           |
| :------------- | :------------------- | :--------------- | :----- | :-------------------- | :---------------------------------------------------------------------------------------------------- |
| `pointOfEntry` | ---                  | ---              | string |                       | The container in which to insert and (then) display the table with the notes.                         |
| `module` {}    | ---                  | ---              |        |                       |                                                                                                       |
| ---            | `id`                 | ---              | string | 'module-' + Unix Time | The value used to identify the module and its units.                                                  |
| ---            | `name`               | ---              | string | 'Tab Set'             | The human-friendly name used to identify the module.                                                  |
| ---            | `dataCluster` {}     | ---              |        |                       |                                                                                                       |
| ---            | ---                  | `attributeName`  | string | 'data-ft-cluster'     | The name of the DOM "data-" attribute used to identify the elements to be processed in the module.    |
| ---            | ---                  | `attributeValue` | string | `id`                  | The value of the DOM "data-" attribute used to identify the elements to be processed in the module.   |
| ---            | `documentCluster` {} | ---              |        |                       |                                                                                                       |
| ---            | ---                  | `attributeName`  | string | ''                    | The name of the DOM "data-" attribute used to identify the elements to be used by Data Template.      |
| ---            | ---                  | `attributeValue` | string | ''                    | The value of the DOM "data-" attribute used to identify the elements to be used by Data Template.     |
| `template` {}  | ---                  | ---              |        |                       |                                                                                                       |
| ---            | `referenceModel`     | ---              | string |                       | The DOM id of the element containing the template to be used to generate the units.                   |
| ---            | `postProcessing`     | ---              | string |                       | A callback to enable listeners/actions in newly created units. Available arguments: moduleID, unitID. |
| `data` {}      | ---                  | ---              |        |                       |                                                                                                       |
| ---            | `getURL`             | ---              | string |                       | The URL to perform the GET/Get request.                                                               |
| ---            | `postURL`            | ---              | string |                       | The URL to perform the POST/Create request.                                                           |
| ---            | `putURL`             | ---              | string |                       | The URL to perform the PUT/Update request.                                                            |
| ---            | `deleteURL`          | ---              | string |                       | The URL to perform the DELETE/Delete request.                                                         |
| ---            | `csrfToken`          | ---              | string |                       | The token used to protect from cross-site request forgery.                                            |

## Utilities

Forefront Toolkit contains several utilities, some of them directly used in the library, others to be used separately or in combination with it.

You can browse all the utilities in the [source files](src/utilities/).

The following ones are the utilities that require a DOM attribute to work:

1. Alerts

- Functions: createAlertsModule() - See form_utilities for the function attributes.
- DOM attributes: **data-ft-alerts**: a string used to identify the DOM element/s in which the alerts will be shown.

2. Status Snippet

- Functions: showSubmissionStatusAlert(), hideSubmissionStatusAlert() - See form_utilities for the function attributes.
- DOM attribute: **data-ft-status-snippet**: a string used to identify the DOM element/s in which the status snippet will be shown.

## Dependencies

Required by Forefront Toolkit:

- bootstrap (5.0.2)
- lodash (4.17.21)

For development and testing:

- webpack (4.39.1)
- webpack-cli (3.3.12)

## Disclaimer

Please, read section 6 and 7 of the [LICENSE](LICENSE).

For the content not covered by the licence:

FOREFRONT TOOLKIT AND ANY RELATED CONTENT IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Copyright

Copyright (c) 2021 Francesco Ugolini
