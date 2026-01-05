/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from "gi://Clutter";
import GLib from 'gi://GLib';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

//GLOBAL INFO
let extUID = '';
let shCmd = './memcalc.sh';
let timeOutCount = 3;
//widgets
let panelLabel, timeOutId;

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('HARDWARE INFO'));

            if (panelLabel != null) {
                this.add_child(panelLabel);
            } else {
                panelLabel.set_text('ERROR!');
            }

            let item = new PopupMenu.PopupMenuItem(_('Show Notification'));
            item.connect('activate', () => {
                Main.notify(_('COMING SOON'));
            });
            this.menu.addMenuItem(item);
        }
    });

function initLabelWidget(initialValue) {
    panelLabel = new St.Label({
        text: initialValue,
        x_align: Clutter.ActorAlign.CENTER,
        y_align: Clutter.ActorAlign.CENTER,
    });
}

function getMemValue() {
    let outputString = "";
    let dir = `sh -c 'cd ~/.local/share/gnome-shell/extensions/${extUID} && ${shCmd}'`;
    var [ok, out, err, exit] = GLib.spawn_command_line_sync(dir);
    if (ok) {
        //console.log(`**************SUCCESS**************`);
        outputString = new TextDecoder().decode(out)
        return outputString.replace('\n', '');
    }
    console.error(`**************${extUID}ERROR GETTING MEM VALUE ${TextDecoder().decode(err)}**************`);
    if (panelLabel != null) {
        panelLabel.set_text('ERROR!');
    }
    return outputString;
}

function initTimeout() {
    timeOutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, timeOutCount, () => {
        let memValue = getMemValue();
        panelLabel.set_text(memValue);
        return GLib.SOURCE_CONTINUE;
    });
}

function stopTimeOut() {
    if (timeOutId !== null) {
        GLib.Source.remove(timeOutId);
        timeOutId = null;
    }
}


export default class IndicatorExampleExtension extends Extension {
    init() {
        console.log("**************INIT PHASE**************");
    }
    enable() {
        try {
            extUID = this.uuid;
            console.log(`**************${extUID}: ENABLE PHASE**************`);
            initLabelWidget('MEM: LOADING...');
            initTimeout();
            this._indicator = new Indicator();
            Main.panel.addToStatusArea(this.uuid, this._indicator);
        } catch (e) {
            console.log(`**************${extUID}: ERROR INITIALIZING**************`);
        }
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
        panelLabel = null;
        //reset timeout
        stopTimeOut();
    }
}
