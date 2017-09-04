// Using my own implementation of Alert-related stuff until https://github.com/driftyco/ionic/pull/11458 is merged
import { Injectable } from "@angular/core";
import { App, Config } from "ionic-angular";
import { DatetimePickerAlert } from "./alert";
export class DatetimePickerAlertController {
    constructor(app, config) {
        this.app = app;
        this.config = config;
    }
    create(opts = {}) {
        return new DatetimePickerAlert(this.app, opts, this.config);
    }
}
DatetimePickerAlertController.decorators = [
    { type: Injectable },
];
/** @nocollapse */
DatetimePickerAlertController.ctorParameters = () => [
    { type: App, },
    { type: Config, },
];
//# sourceMappingURL=alert.controller.js.map