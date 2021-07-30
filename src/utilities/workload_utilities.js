/**
 * Forefront Toolkit - Workload
 *
 * Copyright (c) 2021 Francesco Ugolini <contact@francescougolini.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
 * distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as date_utilities from './date_utilities.js';

export { Workload };

/**
 * A class representing the workloads to be set in different date ranges. Workloads might, for example, be iterative actions,
 * expenses, or verification/analysis of collected data.
 *
 * @param {number} year The full year.
 * @param {[number]} businessDays Default:[1, 2, 3, 4, 5]. An array with the days of week considered as business days.
 * @param {Object} holidays An object containing an array of holidays per month (0-11). E.g. { 11: [25, 26] }
 */
class Workload {
  constructor(year, businessDays, holidays) {
    if (year && /\d\d\d\d/.test(year)) {
      this.year = year;
      this.businessDays = businessDays && businessDays.length > 0 ? businessDays : [1, 2, 3, 4, 5];

      this.maps = {};
      this.maps.months = new Map();
      this.maps.businessDaysPerMonth = new Map();

      for (let month = 0; month < 12; month++) {
        this.maps.businessDaysPerMonth.set(
          month,
          date_utilities.getBusinessDays(this.year, month, this.businessDays, holidays)
        );

        // Calculate the number of the week and it's length in day for a given month (the reason for the length) and year.
        let firstWeekLength = 0;

        const firstDayOfMonth = new Date(this.year, month, 1);
        const firstWeek = date_utilities.getISOWeekNumber(firstDayOfMonth);

        for (let day = 0; day < 6; day++) {
          const nextDay = new Date(this.year, month, day + 1);

          const nextDayWeek = date_utilities.getISOWeekNumber(nextDay);

          if (firstWeek == nextDayWeek && nextDay.getDay() != 0 && nextDay.getDay() != 6) {
            firstWeekLength += 1;
          }
        }

        const lastWeekLength =
          (this.maps.businessDaysPerMonth.get(month).length - (firstWeekLength < 5 ? firstWeekLength : 0)) % 5;

        const fullWeeks =
          (this.maps.businessDaysPerMonth.get(month).length -
            (firstWeekLength < 5 ? firstWeekLength : 0) -
            (lastWeekLength < 5 ? lastWeekLength : 0)) /
          5;

        let weekLength = [];

        if (firstWeekLength < 5 && firstWeekLength != 0) {
          weekLength.push([firstWeek, firstWeekLength]);
        }

        for (let a = 0; a < fullWeeks; a++) {
          weekLength.push([firstWeek + a + (firstWeekLength < 5 ? 1 : 0), 5]);
        }

        if (lastWeekLength < 5 && lastWeekLength != 0) {
          weekLength.push([firstWeek + fullWeeks + (firstWeekLength < 5 ? 1 : 0), lastWeekLength]);
        }

        this.maps.months.set(month, weekLength);
      }

      console.log(this.maps.businessDaysPerMonth);
    } else {
      throw 'Workload Error: invalid or missing year.';
    }
  }

  /**
   * Get the number of the weeks of a given month.
   *
   * @param {number} month An integer number, between 0 and 11.
   * @returns An array with the weeks listed as items.
   */
  getWeeks(month) {
    let weeks = [];

    for (let i = 0; i < this.maps.months.get(month).length; i++) {
      weeks.push(this.maps.months.get(month)[i][0]);
    }

    return weeks;
  }

  /**
   * Calculate the workload for each day in a month, given a month workload.
   *
   * @param {number} month An integer number, between 0 and 11.
   * @param {number} workload The workload for the month, which has to be spread over its days.
   * @param {boolean} unitary Default: true. If true, returns results as unitary values.
   * @returns An array with the day and the daily workloads.
   */
  getDailyWorkload(month, workload, unitary = true) {
    const businessDays = this.maps.businessDaysPerMonth.get(month);

    const _calcDailyWorkload = (businessDays, dailyWorkload) => {
      dailyWorkloads = Array.from(businessDays).map((day, index) => {
        return [day, dailyWorkload];
      });
    };

    let dailyWorkloads = [];

    if (unitary) {
      let remainder = workload % businessDays.length;
      const dailyWorkload = (workload - remainder) / businessDays.length;

      _calcDailyWorkload(businessDays, dailyWorkload);

      while (remainder > 0) {
        dailyWorkloads.forEach((dailyWorkload, index) => {
          if (remainder > 0) {
            dailyWorkload[1] = dailyWorkload[1] + 1;
            remainder--;
          }
        });
      }
    } else {
      const dailyWorkload = workload / businessDays.length;

      _calcDailyWorkload(businessDays, dailyWorkload);
    }

    return dailyWorkloads;
  }

  /**
   * Calculate the workload for each week in a month, given a month workload.
   *
   * @param {number} month An integer number, between 0 and 11.
   * @param {number} workload The workload for the month, which has to be spread over its weeks.
   * @param {boolean} unitary Default: true. If true, returns results as unitary values.
   * @returns An array with the week and the weekly workloads.
   */
  getWeeklyWorkload(month, workload, unitary = true) {
    const weeks = this.maps.months.get(month);

    const firstWeek = weeks[0][0];
    const firstWeekLength = weeks[0][1];

    const lastWeekLength = weeks[weeks.length - 1][1];

    let fullWeeks = 0;

    for (let i = 0; i < weeks.length; i++) {
      if (weeks[i][1] == 5) {
        fullWeeks += 1;
      }
    }

    const _calcWeeklyWorkload = (firstWeekWorkload, fullWeekWorkload, lastWeekWorkload) => {
      if (firstWeekLength < 5 && firstWeekLength != 0) {
        weeklyWorkloads.push([firstWeek, firstWeekWorkload]);
      }

      for (let a = 0; a < fullWeeks; a++) {
        weeklyWorkloads.push([firstWeek + a + (firstWeekLength < 5 ? 1 : 0), fullWeekWorkload]);
      }

      if (lastWeekLength < 5 && lastWeekLength != 0) {
        weeklyWorkloads.push([firstWeek + fullWeeks + (firstWeekLength < 5 ? 1 : 0), lastWeekWorkload]);
      }
    };

    let weeklyWorkloads = [];

    if (unitary) {
      const fullWeekReminder = workload % weeks.length;

      const fullWeekWorkload = (workload - fullWeekReminder) / weeks.length;

      const firstWeekWorkload = firstWeekLength * Math.floor(fullWeekWorkload / 5);
      const lastWeekWorkload = lastWeekLength * Math.floor(fullWeekWorkload / 5);

      _calcWeeklyWorkload(firstWeekWorkload, fullWeekWorkload, lastWeekWorkload);

      // Include what was left before.
      let remainder = workload - fullWeekWorkload * fullWeeks - firstWeekWorkload - lastWeekWorkload;

      while (remainder > 0) {
        weeklyWorkloads.forEach((weeklyWorkload, index) => {
          if (remainder > 0) {
            weeklyWorkload[1] = weeklyWorkload[1] + 1;
            remainder--;
          }
        });
      }
    } else {
      const weeklyWorkload = workload / weeks.length;

      const firstWeekWorkload = firstWeekLength * (weeklyWorkload / 5);
      const lastWeekWorkload = lastWeekLength * (weeklyWorkload / 5);

      // Include what was left before.
      let remainder = (workload - weeklyWorkload * fullWeeks - firstWeekWorkload - lastWeekWorkload) / fullWeeks;

      _calcWeeklyWorkload(firstWeekWorkload, weeklyWorkload + remainder, lastWeekWorkload);
    }

    return weeklyWorkloads;
  }

  /**
   * Calculate the workload for each month in a year, given the yearly workload.
   *
   * @param {number} workload The workload for the year, which has to be spread over its months.
   * @param {boolean} unitary Default: true. If true, returns results as unitary values.
   * @returns  An array with the month, the business days, and the monthly workloads.
   */
  getMonthlyWorkload(workload, unitary = true) {
    let yearlyWorkload = workload;
    let yearlyBusinessDays = Array.from(this.maps.businessDaysPerMonth).reduce(
      (businessDaysAccumulator, currentMonth) => {
        return businessDaysAccumulator + currentMonth[1].length;
      },
      0
    );

    const _getMonthlyWorkload = (workloadPerBusinessDay) => {
      Array.from(this.maps.businessDaysPerMonth).forEach((month, index) => {
        const monthlyBusinessDays = month[1].length;
        const monthlyWorkload = monthlyBusinessDays * workloadPerBusinessDay;

        monthlyWorkloads.push([month[0], month[1].length, monthlyWorkload]);

        yearlyWorkload = yearlyWorkload - monthlyWorkload;
        yearlyBusinessDays = yearlyBusinessDays - monthlyBusinessDays;
      });
    };

    let monthlyWorkloads = [];

    if (unitary) {
      let remainder = workload % yearlyBusinessDays;
      const workloadPerBusinessDay = (workload - remainder) / yearlyBusinessDays;

      _getMonthlyWorkload(workloadPerBusinessDay);

      while (remainder > 0) {
        monthlyWorkloads.forEach((monthlyWorkload, index) => {
          if (remainder > 0) {
            monthlyWorkload[2] = monthlyWorkload[2] + 1;
            remainder--;
          }
        });
      }
    } else {
      const workloadPerBusinessDay = workload / yearlyBusinessDays;

      _getMonthlyWorkload(workloadPerBusinessDay);
    }

    return monthlyWorkloads;
  }
}
