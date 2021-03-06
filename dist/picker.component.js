import { Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
export class DatetimePickerComponent {
    constructor() {
        this.pickerChange = new EventEmitter();
        this.rows = [0, 1, 2, 3, 4, 5];
        this.cols = [1, 2, 3, 4, 5, 6, 7];
        this.weekdays = [0, 1, 2, 3, 4, 5, 6];
        this.bind = {};
        this.lastDateSet = {
            year: this.year,
            month: this.month,
            day: this.day,
            hour: this.hour,
            minute: this.minute,
            second: this.second,
            date: new Date(),
            getDateWithoutTime() {
                let tempDate = new Date(this.date);
                tempDate.setHours(0, 0, 0, 0);
                return tempDate;
            },
        };
    }
    ngOnInit() {
        if (this.dateEnabled) {
            let today = new Date();
            this.today = {
                day: today.getDate(),
                month: today.getMonth(),
                year: today.getFullYear(),
            };
        }
        if (this.isMondayFirst) {
            this.weekdays = [1, 2, 3, 4, 5, 6, 0];
        }
        this.processModel();
    }
    cellDay(x, y) {
        return y * 7 + x - this.firstDay;
    }
    isDayHidden(x, y) {
        let cellDay = this.cellDay(x, y);
        return cellDay <= 0 || cellDay > this.daysInMonth;
    }
    processModel() {
        let date = this.modelDate instanceof Date ? this.modelDate : new Date();
        this.year = this.dateEnabled ? date.getFullYear() : 0;
        this.month = this.dateEnabled ? date.getMonth() : 0;
        this.day = this.dateEnabled ? date.getDate() : 0;
        this.hour = this.timeEnabled ? date.getHours() : 0;
        this.minute = this.timeEnabled ? date.getMinutes() : 0;
        this.second = this.secondsEnabled ? date.getSeconds() : 0;
        this.changeViewData();
    }
    changeBy(value, unit) {
        if (+value) {
            // DST workaround
            if ((unit === "hour" || unit === "minute") && value === -1) {
                let date = new Date(this.year, this.month, this.day, this.hour - 1, this.minute);
                if ((this.minute === 0 || unit === "hour") && this.hour === date.getHours()) {
                    this.hour--;
                }
            }
            this[unit] += +value;
            if (unit === "month" || unit === "year") {
                this.day = Math.min(this.day, this.getDaysInMonth(this.year, this.month));
            }
            this.changeViewData();
        }
    }
    change(unit) {
        let value = this.bind[unit];
        if (value && unit === "meridiem") {
            value = value.toUpperCase();
            if (value === "AM" && this.meridiem === "PM") {
                this.hour -= 12;
            }
            else if (value === "PM" && this.meridiem === "AM") {
                this.hour += 12;
            }
            this.changeViewData();
        }
        else if (+value || +value === 0) {
            this[unit] = +value;
            if (unit === "month" || unit === "year") {
                this.day = Math.min(this.day, this.getDaysInMonth(this.year, this.month));
            }
            this.changeViewData();
        }
    }
    changeDay(x, y) {
        this.day = this.cellDay(x, y);
        this.changeViewData();
    }
    isEnabled(day, computeNextValidDate) {
        if (!this.onlyValid) {
            return true;
        }
        let currentDate = new Date(this.year, this.month, day);
        let constraints = [].concat(this.onlyValid);
        return constraints.every((currentRule) => {
            let isValid = true;
            if (currentRule.after) {
                let afterDate = this.createDate(currentRule.after);
                if (currentRule.inclusive) {
                    isValid = currentDate >= afterDate;
                    if (!isValid && computeNextValidDate) {
                        this.setNextValidDate(afterDate, 0);
                    }
                }
                else {
                    isValid = currentDate > afterDate;
                    if (!isValid && computeNextValidDate) {
                        this.setNextValidDate(afterDate, 1);
                    }
                }
            }
            else if (currentRule.before) {
                let beforeDate = this.createDate(currentRule.before);
                if (currentRule.inclusive) {
                    isValid = currentDate <= beforeDate;
                    if (!isValid && computeNextValidDate) {
                        this.setNextValidDate(beforeDate, 0);
                    }
                }
                else {
                    isValid = currentDate < beforeDate;
                    if (!isValid && computeNextValidDate) {
                        this.setNextValidDate(beforeDate, -1);
                    }
                }
            }
            else if (currentRule.between) {
                let initialDate = this.createDate(currentRule.between.initial);
                let finalDate = this.createDate(currentRule.between.final);
                if (currentRule.inclusive) {
                    isValid = currentDate >= initialDate && currentDate <= finalDate;
                    if (!isValid && computeNextValidDate) {
                        if (currentDate < initialDate) {
                            this.setNextValidDate(initialDate, 0);
                        }
                        else if (currentDate > finalDate) {
                            this.setNextValidDate(finalDate, 0);
                        }
                    }
                }
                else {
                    isValid = currentDate > initialDate && currentDate < finalDate;
                    if (!isValid && computeNextValidDate) {
                        if (currentDate <= initialDate) {
                            this.setNextValidDate(initialDate, 1);
                        }
                        else if (currentDate >= finalDate) {
                            this.setNextValidDate(finalDate, -1);
                        }
                    }
                }
            }
            else if (currentRule.outside) {
                let initialDate = this.createDate(currentRule.outside.initial);
                let finalDate = this.createDate(currentRule.outside.final);
                if (currentRule.inclusive) {
                    isValid = currentDate <= initialDate || currentDate >= finalDate;
                    if (!isValid && computeNextValidDate) {
                        let lastValidDate = this.lastDateSet.getDateWithoutTime();
                        if (lastValidDate <= initialDate) {
                            this.setNextValidDate(finalDate, 0);
                        }
                        else if (lastValidDate >= finalDate) {
                            this.setNextValidDate(initialDate, 0);
                        }
                    }
                }
                else {
                    isValid = currentDate < initialDate || currentDate > finalDate;
                    if (!isValid && computeNextValidDate) {
                        let lastValidDate = this.lastDateSet.getDateWithoutTime();
                        if (lastValidDate < initialDate) {
                            this.setNextValidDate(finalDate, 1);
                        }
                        else if (lastValidDate > finalDate) {
                            this.setNextValidDate(initialDate, -1);
                        }
                    }
                }
            }
            return isValid;
        });
    }
    changed() {
        this.changeViewData();
    }
    triggerChange() {
        this.pickerChange.emit(new Date(this.year, this.month, this.day, this.hour, this.minute, this.second));
    }
    setNextValidDate(date, dayToAdd) {
        dayToAdd = dayToAdd || 0;
        if (dayToAdd !== 0) {
            date.setDate(date.getDate() + dayToAdd);
        }
        this.lastDateSet.year = date.getFullYear();
        this.lastDateSet.month = date.getMonth();
        this.lastDateSet.day = date.getDate();
        this.lastDateSet.hour = date.getHours();
        this.lastDateSet.minute = date.getMinutes();
        this.lastDateSet.second = date.getSeconds();
        this.lastDateSet.date = date;
    }
    setLastValidDate() {
        let date = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second);
        if (this.isEnabled(date.getDate(), true)) {
            this.setNextValidDate(date);
        }
        else {
            this.year = this.lastDateSet.year;
            this.month = this.lastDateSet.month;
            this.day = this.lastDateSet.day;
            this.hour = this.lastDateSet.hour;
            this.minute = this.lastDateSet.minute;
            this.second = this.lastDateSet.second;
        }
    }
    changeViewData() {
        this.setLastValidDate();
        let date = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second);
        if (this.dateEnabled) {
            this.year = date.getFullYear();
            this.month = date.getMonth();
            this.day = date.getDate();
            this.bind.year = this.year;
            this.bind.month = this.month;
            this.firstDay = new Date(this.year, this.month, 1).getDay();
            if (this.isMondayFirst) {
                this.firstDay = (this.firstDay || 7) - 1;
            }
            this.daysInMonth = this.getDaysInMonth(this.year, this.month);
        }
        if (this.timeEnabled) {
            this.hour = date.getHours();
            this.minute = date.getMinutes();
            this.second = date.getSeconds();
            this.meridiem = this.hour < 12 ? "AM" : "PM";
            this.bind.hour = this.meridiemEnabled ? (this.hour % 12 || 12).toString() : this.hour.toString();
            this.bind.minute = (this.minute < 10 ? "0" : "") + this.minute.toString();
            this.bind.second = (this.second < 10 ? "0" : "") + this.second.toString();
            this.bind.meridiem = this.meridiem;
        }
        this.triggerChange();
    }
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    createDate(stringDate) {
        let date = new Date(stringDate);
        let isInvalidDate = isNaN(date.getTime());
        if (isInvalidDate) {
            date = new Date(); // today
        }
        date.setHours(0, 0, 0, 0);
        return date;
    }
}
DatetimePickerComponent.decorators = [
    { type: Component, args: [{
                selector: "ion-datetime-picker",
                template: `
    <div *ngIf="dateEnabled" class="row month-year">
      <div class="col left-arrow" col-auto>
        <button type="button" ion-button icon-only clear (click)="changeBy(-1, 'month')"><ion-icon name="arrow-back"></ion-icon></button>
      </div>
      <label class="col month-input">
        <div class="item item-input item-select">
          <select [(ngModel)]="bind.month" (change)="change('month')">
            <option *ngFor="let month of monthNames; let numberOfMonth = index" [value]="numberOfMonth">{{month}}</option>
          </select>
        </div>
      </label>
      <label class="col year-input" col-3>
        <div class="item item-input">
          <div>
            <input type="number" [(ngModel)]="bind.year" min="1900" max="2999" (change)="change('year')" (blur)="changed()" required>
          </div>
        </div>
      </label>
      <div class="col right-arrow" col-auto>
        <button type="button" ion-button icon-only clear (click)="changeBy(+1, 'month')"><ion-icon name="arrow-forward"></ion-icon></button>
      </div>
    </div>

    <div *ngIf="dateEnabled" class="row calendar weekdays">
      <div class="col" *ngFor="let weekday of weekdays">
        <div class="weekday">{{weekdayNames[weekday]}}</div>
      </div>
    </div>
    <div *ngIf="dateEnabled">
      <div class="row calendar days" *ngFor="let y of rows">
        <div class="col" *ngFor="let x of cols">
          <div [hidden]="isDayHidden(x, y)"
              (click)="changeDay(x, y)" class="day"
              [ngClass]="{ 'disabled': !isEnabled(cellDay(x, y)), 'selected': cellDay(x, y) === day, 'today': cellDay(x, y) === today.day && month === today.month && year === today.year }">
            {{cellDay(x, y)}}
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="timeEnabled" class="row time-buttons">
      <div class="col"></div>
      <div class="col" col-2><button type="button" ion-button icon-only clear (click)="changeBy(+1, 'hour')"><ion-icon name="arrow-up"></ion-icon></button></div>
      <div class="col"></div>
      <div class="col" col-2><button type="button" ion-button icon-only clear (click)="changeBy(+1, 'minute')"><ion-icon name="arrow-up"></ion-icon></button></div>
      <div *ngIf="secondsEnabled" class="col"></div>
      <div *ngIf="secondsEnabled" class="col" col-2><button type="button" ion-button icon-only clear (click)="changeBy(+1, 'second')"><ion-icon name="arrow-up"></ion-icon></button></div>
      <div *ngIf="meridiemEnabled" class="col"></div>
      <div *ngIf="meridiemEnabled" class="col" col-2><button type="button" ion-button icon-only clear (click)="changeBy(+12, 'hour')"><ion-icon name="arrow-up"></ion-icon></button></div>
      <div class="col"></div>
    </div>
    <div *ngIf="timeEnabled" class="row time">
      <div class="col"></div>
      <label class="col" col-2>
        <div class="item item-input">
          <div>
            <input type="text" [(ngModel)]="bind.hour" pattern="0?([01]?[0-9]|2[0-3])" (change)="change('hour')" (blur)="changed()" required>
          </div>
        </div>
      </label>
      <div class="col colon">:</div>
      <label class="col" col-2>
        <div class="item item-input">
          <div>
            <input type="text" [(ngModel)]="bind.minute" pattern="0?[0-5]?[0-9]" (change)="change('minute')" (blur)="changed()" required>
          </div>
        </div>
      </label>
      <div *ngIf="secondsEnabled" class="col colon">:</div>
      <label *ngIf="secondsEnabled" class="col" col-2>
        <div class="item item-input">
          <div>
            <input type="text" [(ngModel)]="bind.second" pattern="0?[0-5]?[0-9]" (change)="change('second')" (blur)="changed()" required>
          </div>
        </div>
      </label>
      <div *ngIf="meridiemEnabled" class="col"></div>
      <label *ngIf="meridiemEnabled" class="col" col-2>
        <div class="item item-input">
          <div>
            <input type="text" [(ngModel)]="bind.meridiem" pattern="[aApP][mM]" (change)="change('meridiem')" (blur)="changed()" required>
          </div>
        </div>
      </label>
      <div class="col"></div>
    </div>
    <div *ngIf="timeEnabled" class="row time-buttons">
      <div class="col"></div>
      <div class="col" col-2><button type="button" ion-button icon-only clear (click)="changeBy(-1, 'hour')"><ion-icon name="arrow-down"></ion-icon></button></div>
      <div class="col"></div>
      <div class="col" col-2><button type="button" ion-button icon-only clear (click)="changeBy(-1, 'minute')"><ion-icon name="arrow-down"></ion-icon></button></div>
      <div *ngIf="secondsEnabled" class="col"></div>
      <div *ngIf="secondsEnabled" class="col" col-2><button type="button" ion-button icon-only clear (click)="changeBy(-1, 'second')"><ion-icon name="arrow-down"></ion-icon></button></div>
      <div *ngIf="meridiemEnabled" class="col"></div>
      <div *ngIf="meridiemEnabled" class="col" col-2><button type="button" ion-button icon-only clear (click)="changeBy(-12, 'hour')"><ion-icon name="arrow-down"></ion-icon></button></div>
      <div class="col"></div>
    </div>
  `,
                styles: [`
    :host {
      padding: 0 5px;
      overflow-x: hidden;
      overflow-y: auto;
    }

    input, select {
      width: 100%;
      height: 100%;
      max-width: none;
      text-align: center;
      padding: .1em 5px 0;

      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      background-color: #fff;
      border: 1px solid #999;
    }

    input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
      display: none;
    }

    .item-input {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
    }

    .calendar {
      text-align: center;
    }
    .calendar .col {
      padding: 0;
    }
    .calendar .day, .calendar .weekday {
      padding: 10px 5px;
    }
    .calendar .day:hover, .calendar .day.activated, .calendar .day.today:hover, .calendar .day.today.activated {
      background-color: #bdf;
      color: black;
      cursor: pointer;
    }
    .calendar .day.today {
      background-color: #e4e4e4;
    }
    .calendar .day.selected, .calendar .day.selected:hover, .calendar .day.selected.activated {
      background-color: #387ef5;
      color: white;
    }
    .calendar .day.disabled, .calendar .day.disabled:hover, .calendar .day.disabled.activated {
      background-color: #ccc;
    }
    .calendar .weekday {
      font-weight: bold;
    }

    .month-year {
      padding: 0;
      text-align: center;
    }
    .month-year .button {
      padding: 0;
      margin: 0;
      width: 1.5em;
      height: 1.7em;
      min-width: 0;
      min-height: 0;
    }
    .month-year input, .month-year select {
      font-size: 1em;
    }

    .time-buttons .col {
      padding: 0;
    }
    .time-buttons .button {
      padding: 0;
      margin: 0;
      width: 100%;
      height: 2em;
      min-width: 0;
      min-height: 0;
    }
    .time-buttons:first-child {
      padding-top: 0;
    }
    .time-buttons:last-child {
      padding-bottom: 0;
    }

    .time .col {
      padding: 0;
    }
    .time .colon {
      color: #999;
      font-size: 1.5em;
      padding: 0;
      text-align: center;
    }
    .time input {
      font-size: 1.2em;
    }
  `],
                encapsulation: ViewEncapsulation.Emulated,
            },] },
];
/** @nocollapse */
DatetimePickerComponent.ctorParameters = () => [];
DatetimePickerComponent.propDecorators = {
    'modelDate': [{ type: Input },],
    'dateEnabled': [{ type: Input },],
    'timeEnabled': [{ type: Input },],
    'isMondayFirst': [{ type: Input },],
    'secondsEnabled': [{ type: Input },],
    'meridiemEnabled': [{ type: Input },],
    'onlyValid': [{ type: Input },],
    'monthNames': [{ type: Input },],
    'weekdayNames': [{ type: Input },],
    'pickerChange': [{ type: Output },],
};
//# sourceMappingURL=picker.component.js.map