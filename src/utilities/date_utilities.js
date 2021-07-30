/**
 * Forefront Toolkit - Date Utilities
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

export {
  createDateTextField,
  getDateFromString,
  getTodaysDate,
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

/**
 * Create a pseudo-date field.
 *
 * @param {string} dateFieldID The DOM ID of the field in which the pseudo-date will be shown.
 */
function createDateTextField(dateFieldID) {
  function checkValue(str, max) {
    if (str.charAt(0) !== '0' || str == '00') {
      let num = parseInt(str);

      if (isNaN(num) || num <= 0 || num > max) {
        num = '';
      }

      //str = (num > parseInt(max.toString().charAt(0)) && num.toString().length == 1) ? '0' + num.toString() : num.toString();
      str = num.toString();
    }

    return str;
  }

  const dateField = document.querySelector('#' + dateFieldID);

  dateField.addEventListener('input', (event) => {
    event.target.type = 'text';

    let input = event.target.value.toString();

    if (/\D\/$/.test(input)) {
      input = input.substr(0, input.length - 3);
    }

    let values = [];

    let singleDigitValues = input.match(/\d{1}\/{1}/g);

    if (singleDigitValues && singleDigitValues.length > 0 && singleDigitValues.length < 3 && input.length < 8) {
      // 1. If there is a single digit followed by a "/", make sure a 0 is added
      input.split('/').forEach((value, index) => {
        value = value.trim();

        if (value && value.length < 2) {
          values.push('0' + value);
        } else if (value || value === 0) {
          values.push(value.toString());
        }
      });
    } else {
      // 2. For the rest of the cases, simply make sure the input data is made only of digits.
      input.split('/').forEach((value, index) => {
        value = value.trim();

        if ((input.length == 12 || input.length == 13) && value.length == 1) {
          value = value !== 0 ? '0' + value : '';
        }

        values.push(value.replace(/\D/g, ''));
      });
    }

    if (values[0]) {
      values[0] = checkValue(values[0], 31);
    }

    if (values[1]) {
      values[1] = checkValue(values[1], 12);
    }

    let output = values.map(function (value, index) {
      return value.length == 2 && index < 2 ? value + ' / ' : value;
    });

    event.target.value = output.join('').substr(0, 14);
  });

  dateField.addEventListener('blur', (event) => {
    event.target.type = 'text';

    let input = event.target.value.toString();

    let values = input.split('/').map(function (v, i) {
      return v.replace(/\D/g, '');
    });

    let output = input;

    if (values.length == 3 && values[2].length == 4) {
      let year = parseInt(values[2]);
      let month = parseInt(values[1]) - 1;
      let day = parseInt(values[0]);
      let d = new Date(year, month, day);

      if (!isNaN(d)) {
        let dates = [d.getDate(), d.getMonth() + 1, d.getFullYear()];
        output = dates
          .map(function (v) {
            v = v.toString();
            return v.length == 1 ? '0' + v : v;
          })
          .join(' / ');
      }
    }

    event.target.value = output;
  });
}

/**
 * Create a Date object from a given "date-like" formatted string.
 *
 * @param {string} dateString The string to be parsed as a Date object.
 */
function getDateFromString(dateString) {
  let newDate = new Date();
  dateString = dateString.split(' / ');

  newDate.setFullYear(dateString[2]);
  newDate.setMonth(dateString[1]);
  newDate.setDate(dateString[0]);

  return newDate;
}

/**
 * Generate today's day according to the European standard
 */
function getTodaysDate() {
  let newDate = new Date();

  let month = newDate.getMonth() + 1;
  let day = newDate.getDate();

  let today = (day < 10 ? '0' : '') + day + ' / ' + (month < 10 ? '0' : '') + month + ' / ' + newDate.getFullYear();

  return today;
}

/**
 * Convert a string representation of a date in ISO standard (yyyy-mm-dd) in the European standard (dd/mm/yyyy).
 *
 * @param {string} isoDateString A string formatted according to the ISO standard.
 * @param {string} spaced (Optional) If 'spaced', return a date according to the EU standard WITH spaces, i.e. dd / mm / yyyy
 * @param {boolean} lineBreak (Optional) For datetime string, display the time on a new line (\n is used to break the line).
 */
function convertIsoDateInEuDate(isoDateString, spaced, lineBreak) {
  let isoDateTimeFormatRegex = new RegExp('\\d{4}-\\d{1,2}-\\d{1,2}T\\d{1,2}:\\d{1,2}:\\d{1,2}');
  let isoDateFormatRegex = new RegExp('\\d{4}-\\d{1,2}-\\d{1,2}');

  let euDateConvertedString = '';

  if (isoDateFormatRegex.test(isoDateString)) {
    let isoDate = isoDateString.match(/\d{4}-\d{1,2}-\d{1,2}/);

    let arrayIsoDate = isoDate[0] ? isoDate[0].split('-') : ['-', '-', '-'];

    if (spaced == 'spaced') {
      euDateConvertedString += arrayIsoDate[2] + ' / ' + arrayIsoDate[1] + ' / ' + arrayIsoDate[0];
    } else {
      euDateConvertedString += arrayIsoDate[2] + '/' + arrayIsoDate[1] + '/' + arrayIsoDate[0];
    }
  }

  if (isoDateTimeFormatRegex.test(isoDateString)) {
    let isoTime = isoDateString.match(/\d{1,2}:\d{1,2}:\d{1,2}/);

    euDateConvertedString += isoTime[0] ? (lineBreak ? '<br />' : ' ') + isoTime[0] : ' -:-:-';
  }

  return euDateConvertedString;
}

/**
 * Convert a EU formatted date string in a ISO formatted date string.
 * @param {string} euDateString A string formatted according to the EU standard.
 */
function convertEuDateInIsoDate(euDateString) {
  let euDateTimeFormatRegex = new RegExp(
    '\\d{1,2}\\s{0,1}/\\s{0,1}\\d{1,2}\\s{0,1}/\\s{0,1}\\d{4}s\\d{1,2}:\\d{1,2}:\\d{1,2}'
  );
  let euDateFormatRegex = new RegExp('\\d{1,2}\\s{0,1}/\\s{0,1}\\d{1,2}\\s{0,1}/\\s{0,1}\\d{4}');

  let isoDateConvertedString = '';

  if (euDateFormatRegex.test(euDateString)) {
    let extractedDate = euDateString.match(/\d{1,2}\s{0,1}\/\s{0,1}\d{1,2}\s{0,1}\/\s{0,1}\d{4}/);

    let arrayDate = extractedDate[0].split(/ {0,}\/ {0,}/);

    isoDateConvertedString = arrayDate[2] + '-' + arrayDate[1] + '-' + arrayDate[0];
  }

  if (euDateTimeFormatRegex.test(euDateString)) {
    let extractedTime = euDateString.match(/\d{1,2}:\d{1,2}:\d{1,2}/);

    isoDateConvertedString += extractedTime ? 'T' + extractedTime : '';
  }

  return isoDateConvertedString;
}

/**
 * Calculate the ISO week date according to ISO 8601 (Weeks start with Monday. Each week's year is the Gregorian year in which the Thursday falls.
 * The first week of the year, hence, always contains 4 January. See https://en.wikipedia.org/wiki/ISO_week_date for further information.
 *
 * @param {string} dmyDate A Date Object or a DD/MM/YYYY EU formatted string with or without spaces (i.e. dd/mm/yyyy or dd / mm / yyyy).
 */
function getISOWeekNumber(dmyDate) {
  let arrDmyDate = null;
  let creationDate = null;

  if (Object.prototype.toString.call(dmyDate) == '[object String]') {
    dmyDate = dmyDate.replace(/\s/gi, '');

    arrDmyDate = dmyDate.split('/');

    creationDate = new Date(parseInt(arrDmyDate[2]), parseInt(arrDmyDate[1]) - 1, parseInt(arrDmyDate[0]));
  } else if (Object.prototype.toString.call(dmyDate) == '[object Date]') {
    arrDmyDate = [dmyDate.getDate(), dmyDate.getMonth() + 1, dmyDate.getFullYear()];

    // NB Set the given date at midnight to avoid bad rounding
    creationDate = new Date(dmyDate.setHours(0, 0, 0, 0));
  }

  let firstJan = new Date(parseInt(arrDmyDate[2]), 0, 1);

  let yearFirstDay = Math.floor(firstJan / 86400000);

  let unixCreationDate = Math.ceil(creationDate / 86400000);

  let ordinalDate = unixCreationDate - yearFirstDay;

  let weekDay = creationDate.getDay() == 0 ? 7 : creationDate.getDay();

  let weekOfYear = Math.floor((ordinalDate - weekDay + 10) / 7);

  return weekOfYear;
}

/**
 * Calculate the start date given a week number and a year.
 *
 * @param {number} week The number of week in a year.
 * @param {number} year The year of the week.
 */
function getWeekStartDate(year, week) {
  let firstDayOfWeek = new Date(year, 0, 1 + (week - 1) * 7);
  let dayOfWeek = firstDayOfWeek.getDay();
  let dmyDate = firstDayOfWeek;

  if (dayOfWeek <= 4) {
    dmyDate.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay() + 1);
  } else {
    dmyDate.setDate(firstDayOfWeek.getDate() + 8 - firstDayOfWeek.getDay());
  }

  return dmyDate;
}

/**
 * Calc the last day of a given month.
 *
 * @param {number} year The year from which the last date of the month is calculated (to count for leap year).
 * @param {number} month The month whose last day is to be calculated. An integer number, between 0 and 11.
 */
function getEndOfMonth(year, month) {
  let lastDay = 0;

  for (let i = 28; i < 32; i++) {
    if (new Date(year, month, i).getMonth() == month) {
      lastDay = i;
    }
  }

  return lastDay;
}

/**
 * Return a properly formed date/time string (i.e. with 0 before single digit day, month, and time) in the EU standard.
 *
 * @param {number} year Required if month and day are specified.
 * @param {number} month Required if year and day are specified.
 * @param {number} day Required if year and month are specified.
 * @param {number} hours Required if minutes and seconds are specified.
 * @param {number} minutes Required if hours and seconds are specified.
 * @param {number} seconds Required if hours and minutes are specified.
 * @param {boolean} spaced Return a space separated date, i.e. dd / mm / yyyy string representation of the date.
 * @param {boolean} lineBreak Show the date and time on two different lines (using \n).
 * @param {boolean} showDate Display the date.
 * @param {boolean} showTime Display the time.
 */
function getDateTimeInEuFormat(year, month, day, hours, minutes, seconds, spaced, lineBreak, showDate, showTime) {
  // TODO: replace the booleans check with true and refactor the associated instances.

  // By default show the date, but not the time
  showDate = showDate ? showDate : true;
  showTime = showTime ? showTime : false;

  let date = '';
  let time = '';

  if (showDate) {
    date =
      (day ? (day < 10 ? '0' + day.toString().replace(/0{1,}/gi, '') : day) + '/' : '') +
      (month ? (month < 10 ? '0' + month.toString().replace(/0{1,}/gi, '') : month) + '/' : '') +
      (year ? year : '');
  }

  if (showTime) {
    time =
      (hours || hours == 0 ? (hours < 10 ? '0' + hours : ' ' + hours) : '') +
      (minutes || minutes == 0 ? (minutes < 10 ? ':0' + minutes : ':' + minutes) : '') +
      (seconds || seconds == 0 ? (seconds < 10 ? ':0' + seconds : ':' + seconds) : '');
  }

  let dateTime = date + (lineBreak ? '<br />' : '') + (date && time ? ' ' : '') + time;

  // If "spaced" is specified in the arguments, put spaces (ONLY) between day, month, and year.
  if (spaced) {
    dateTime = dateTime.replace(/\//gi, ' / ');
  }

  return dateTime;
}

/**
 * Calculate the days in the given month.
 *
 * @param {number} year The full year.
 * @param {number} month The month whose length is to be calculated. An integer number, between 0 and 11.
 * @returns The length of the given month.
 */
function getDaysInMonth(year, month) {
  return 32 - new Date(year, month, 32).getDate();
}

/**
 * Check if the day is not Saturday or Sunday.
 *
 * @param {number} year The full year.
 * @param {number} month The month where the week belongs. An integer number, between 0 and 11.
 * @param {number} day The day whose day of the week is to be calculated. An integer number, between 1 and 31.
 * @param {[number]} businessDays Default: [1, 2, 3, 4, 5]. The days of the week considered to be business days.
 * @param {[number]} holydays The date of the month that, although a business days, is not considered as such.
 * @returns True if it's a business day, otherwise false.
 */
function isBusinessDay(year, month, day, businessDays = [1, 2, 3, 4, 5], holydays = []) {
  const date = new Date(year, month, day);

  if (holydays.length > 0 && holydays.includes(date.getDate())) {
    return false;
  } else if (businessDays.length > 0 && businessDays.includes(date.getDay())) {
    return true;
  } else {
    return false;
  }
}

/**
 * Get the business days in a month.
 *
 * @param {number} year The full year.
 * @param {number} month The month where the business weeks belongs. An integer number, between 0 and 11.
 * @param {[number]} businessDays An array containing the days of the week considered to be business days.
 * @returns An array with the business days in a given month.
 */
function getBusinessDays(year, month, businessDays, holidays) {
  const days = getDaysInMonth(year, month);

  let businessDaysInMonth = [];

  for (let day = 1; day <= days; day++) {
    if (isBusinessDay(year, month, day, businessDays, holidays)) {
      businessDaysInMonth.push(day);
    }
  }

  return businessDaysInMonth;
}

/**
 * Class representing the first and the last date of a month.
 *
 * @param {number} year The full year.
 * @param {number} month An integer number, between 0 and 11.
 * @param {number} day An integer number, between 1 and 31.
 * @param {number} hours An integer number, between 0 and 23.
 * @param {number} minutes An integer number, between 0 and 59.
 * @param {number} seconds An integer number, between 0 and 59.
 */
class DateRange {
  constructor(year, month, day, hours, minutes, seconds) {
    this.day = day ? day : undefined;
    this.month = month ? month : undefined;
    this.year = year ? year : undefined;
    this.hours = hours ? hours : undefined;
    this.minutes = minutes ? minutes : undefined;
    this.seconds = seconds ? seconds : undefined;
  }

  /**
   * Calculate the first and last date of a DateRange object.
   */
  calcStartEndDates() {
    const today = new Date();

    const startYear = this.year ? this.year : today.getFullYear();
    const startMonth = this.month ? this.month : 0;
    const startDay = this.day ? this.day : 1;
    const startHours = this.hours || this.hours === 0 ? this.hours : 0;
    const startMinutes = this.minutes || this.minutes === 0 ? this.minutes : 0;
    const startSeconds = this.seconds || this.seconds === 0 ? this.seconds : 0;

    let startDate = this.year ? new Date(startYear, startMonth, startDay, startHours, startMinutes, startSeconds) : '';

    const endYear = this.year ? this.year : today.getFullYear();
    const endMonth = this.month ? this.month : 11;
    const endDay = this.day ? this.day : getEndOfMonth(endYear, endMonth);
    const endHours = this.hours || this.hours === 0 ? this.hours : 23;
    const endMinutes = this.minutes || this.minutes === 0 ? this.minutes : 59;
    const endSeconds = this.seconds || this.seconds === 0 ? this.seconds : 59;

    let endDate = this.year ? new Date(endYear, endMonth, endDay, endHours, endMinutes, endSeconds) : '';

    return [startDate, endDate];
  }

  /**
   * Return the first day of a DateRange object.
   */
  getStartDate() {
    return this.calcStartEndDates()[0];
  }

  /**
   * Return the last day of a DateRange object.
   */
  getEndDate() {
    return this.calcStartEndDates()[1];
  }
}
