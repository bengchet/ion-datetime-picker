// Using my own implementation of Alert-related stuff until https://github.com/driftyco/ionic/pull/11458 is merged
import { EventEmitter, Output } from "@angular/core";
import { ViewController } from "ionic-angular";
import { AlertMdPopIn, AlertMdPopOut, AlertPopIn, AlertPopOut, AlertWpPopIn, AlertWpPopOut } from "ionic-angular/components/alert/alert-transitions";
import { isPresent } from "ionic-angular/util/util";
import { DatetimePickerAlertComponent } from "./alert.component";
export class DatetimePickerAlert extends ViewController {
    constructor(app, opts = {}, config) {
        opts.inputs = opts.inputs || [];
        opts.buttons = opts.buttons || [];
        opts.enableBackdropDismiss = isPresent(opts.enableBackdropDismiss) ? !!opts.enableBackdropDismiss : true;
        super(DatetimePickerAlertComponent, opts, null);
        this.app = app;
        this.isOverlay = true;
        config.setTransition("alert-pop-in", AlertPopIn);
        config.setTransition("alert-pop-out", AlertPopOut);
        config.setTransition("alert-md-pop-in", AlertMdPopIn);
        config.setTransition("alert-md-pop-out", AlertMdPopOut);
        config.setTransition("alert-wp-pop-in", AlertWpPopIn);
        config.setTransition("alert-wp-pop-out", AlertWpPopOut);
        this.ionChange = new EventEmitter();
    }
    getTransitionName(direction) {
        let key = (direction === "back" ? "alertLeave" : "alertEnter");
        return this._nav && this._nav.config.get(key);
    }
    setTitle(title) {
        this.data.title = title;
        return this;
    }
    setSubTitle(subTitle) {
        this.data.subTitle = subTitle;
        return this;
    }
    addButton(button) {
        this.data.buttons.push(button);
        return this;
    }
    setCssClass(cssClass) {
        this.data.cssClass = cssClass;
        return this;
    }
    setMode(mode) {
        this.data.mode = mode;
    }
    present(navOptions = {}) {
        navOptions.minClickBlockDuration = navOptions.minClickBlockDuration || 400;
        return this.app.present(this, navOptions);
    }
    refresh() {
        console.assert(!!this._cmp, "componentRef must be valid");
        console.assert(!!this._cmp.instance.refresh, "instance must implement refresh()");
        if (this._cmp && this._cmp.instance.refresh) {
            this._cmp.instance.refresh();
        }
    }
}
DatetimePickerAlert.propDecorators = {
    'ionChange': [{ type: Output },],
};
//# sourceMappingURL=alert.js.map