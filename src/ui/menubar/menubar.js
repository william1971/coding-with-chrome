/**
 * @fileoverview Menubar for the Coding with Chrome editor.
 *
 * @license Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mbordihn@google.com (Markus Bordihn)
 */
goog.provide('cwc.ui.Menubar');

goog.require('cwc.HelpMenu');
goog.require('cwc.soy.Menubar');
goog.require('cwc.ui.DeviceMenu');
goog.require('cwc.ui.ExampleMenu');
goog.require('cwc.ui.FileMenu');
goog.require('cwc.ui.Helper');
goog.require('cwc.utils.Helper');
goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.dispose');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.positioning.Corner');
goog.require('goog.soy');
goog.require('goog.ui.CheckBoxMenuItem');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.Menu');
goog.require('goog.ui.PopupMenu');
goog.require('goog.ui.Separator');
goog.require('goog.ui.SubMenu');
goog.require('goog.ui.menuBar');



/**
 * @param {!cwc.utils.Helper} helper
 * @constructor
 * @struct
 * @final
 */
cwc.ui.Menubar = function(helper) {
  /** @type {string} */
  this.name = 'Menubar';

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.prefix = 'menubar-';

  /** @type {string} */
  this.generalPrefix = this.helper.getPrefix();

  /** @type {Element} */
  this.node = null;

  /** @type {Element} */
  this.nodeMenu = null;

  /** @type {Element} */
  this.nodeNew = null;

  /** @type {Element} */
  this.nodeHelp = null;

  /** @type {Element} */
  this.nodeAccountLogin = null;

  /** @type {Element} */
  this.nodeAccountLogout = null;

  /** @type {Element} */
  this.nodeBluetooth = null;

  /** @type {Element} */
  this.nodeBluetoothConnected = null;

  /** @type {Element} */
  this.nodeBluetoothDisabled = null;

  /** @type {Element} */
  this.nodeUsb = null;

  /** @type {Element} */
  this.nodeCloseButton = null;

  /** @type {Element} */
  this.nodeExampleMenu = null;

  /** @type {Element} */
  this.nodeFileMenu = null;

  /** @type {Element} */
  this.nodeHelpMenu = null;

  /** @type {Element} */
  this.nodeNewMenu = null;

  /** @type {Element} */
  this.nodeSettings = null;

  /** @type {goog.ui.Button} */
  this.menu = cwc.ui.Helper.getIconButton('menu', 'Menu');

  /** @type {goog.ui.Button} */
  this.menuNew = cwc.ui.Helper.getIconButton('add',
      'Create a new project', this.requestShowSelectScreen.bind(this));

  /** @type {goog.ui.PopupMenu} */
  this.menuPopup = null;

  /** @type {cwc.ui.FileMenu} */
  this.fileMenu = null;

  /** @type {cwc.ui.DeviceMenu} */
  this.deviceMenu = null;

  /** @type {cwc.ui.ExampleMenu} */
  this.exampleMenu = null;

  /** @type {!goog.ui.Button} */
  this.closeButton = cwc.ui.Helper.getIconButton(
      'close', 'Close', this.requestCloseWindow.bind(this));

  /** @type {!goog.ui.Button} */
  this.accountLogin = cwc.ui.Helper.getIconButton(
      'perm_identity', 'Login', this.loginAccount.bind(this));

  /** @type {!goog.ui.Button} */
  this.accountLogout = cwc.ui.Helper.getIconButton(
      'person', 'Logout', this.logoutAccount.bind(this));

  /** @type {!goog.ui.Button} */
  this.bluetoothMenu = cwc.ui.Helper.getIconButton('bluetooth',
      'Connect Bluetooth device …');

  /** @type {!goog.ui.Button} */
  this.bluetoothConnected = cwc.ui.Helper.getIconButton(
      'bluetooth_connected', 'Disconnect Bluetooth device …');

  /** @type {!goog.ui.Button} */
  this.bluetoothDisabled = cwc.ui.Helper.getIconButton(
      'bluetooth_disabled', 'Bluetooth is disabled!',
      this.checkBluetoothState_.bind(this));

  /** @type {!goog.ui.Button} */
  this.usbMenu = cwc.ui.Helper.getIconButton('usb', 'Connect USB device …');

  /** @type {!goog.ui.Button} */
  this.settingsMenu = cwc.ui.Helper.getIconButton(
      'settings', 'Settings');

  /** @type {!goog.ui.Button} */
  this.helpMenu = cwc.ui.Helper.getIconButton(
      'help_outline', 'Help');

  /** @type {!goog.ui.MenuItem} */
  this.menuExit = cwc.ui.Helper.getMenuItem('Exit',
      this.requestCloseWindow, this);
};


/**
 * Decorates the given node and adds the menu bar.
 * @param {Element} node The target node to add the menu bar.
 * @param {string=} opt_prefix Additional prefix for the ids of the
 *    inserted elements and style definitions.
 * @export
 */
cwc.ui.Menubar.prototype.decorate = function(node, opt_prefix) {
  this.node = node;
  this.prefix = opt_prefix + this.prefix;

  goog.soy.renderElement(
      this.node,
      cwc.soy.Menubar.menubarTemplate,
      {'prefix': this.prefix}
  );

  goog.style.installStyles(
      cwc.soy.Menubar.menubarStyle({ 'prefix': this.prefix })
  );

  // Menu icon
  this.nodeMenu = goog.dom.getElement(this.prefix + 'menu');
  this.menu.render(this.nodeMenu);
  this.decorateMainMenu_(this.nodeMenu);

  // New icon
  this.nodeNewMenu = goog.dom.getElement(this.prefix + 'new');
  this.menuNew.render(this.nodeNewMenu);

  // Bluetooth icons
  if (this.helper.checkChromeFeature('bluetooth')) {
    this.deviceMenu = new cwc.ui.DeviceMenu(this.helper);

    // Bluetooth enabled
    this.nodeBluetooth = goog.dom.getElement(this.prefix + 'bluetooth');
    this.bluetoothMenu.render(this.nodeBluetooth);
    this.deviceMenu.decorateConnect(this.nodeBluetooth);

    // Bluetooth connected
    this.nodeBluetoothConnected = goog.dom.getElement(
        this.prefix + 'bluetooth-connected');
    this.bluetoothConnected.render(this.nodeBluetoothConnected);
    this.deviceMenu.decorateDisconnect(this.nodeBluetoothConnected);

    // Bluetooth disabled
    this.nodeBluetoothDisabled = goog.dom.getElement(
        this.prefix + 'bluetooth-disabled');
    this.bluetoothDisabled.render(this.nodeBluetoothDisabled);
  }

  // USB and serial icon
  if (this.helper.checkChromeFeature('serial') &&
      this.helper.checkChromeFeature('usb')) {
    //this.usbMenu = new cwc.ui.usbMenu(this.helper);
    this.nodeUsbEnabled = goog.dom.getElement(this.prefix + 'usb-enabled');
  }

  // Account icons
  if (this.helper.checkChromeFeature('oauth2')) {
    this.nodeAccountLogin = goog.dom.getElement(
        this.prefix + 'account');
    this.accountLogin.render(this.nodeAccountLogin);

    this.nodeAccountLogout = goog.dom.getElement(
        this.prefix + 'account-logout');
    this.accountLogout.render(this.nodeAccountLogout);
  }

  // Settings icon
  if (this.helper.debugEnabled('SETTINGS')) {
    this.nodeSettings = goog.dom.getElement(this.prefix + 'settings');
    this.settingsMenu.render(this.nodeSettings);
  }

  // Help icon
  this.nodeHelp = goog.dom.getElement(this.prefix + 'help');
  this.helpMenu.render(this.nodeHelp);
  this.decorateHelpMenu_(this.nodeHelp);

  // Close icon
  this.nodeCloseButton = goog.dom.getElement(this.prefix + 'close');
  this.closeButton.render(this.nodeCloseButton);
};


/**
 * Decorates the main menu.
 * @param {Element} node
 * @private
 */
cwc.ui.Menubar.prototype.decorateMainMenu_ = function(node) {
  if (!node) {
    console.log('Was not able to decorate main menu!');
    return;
  }

  var menu = new goog.ui.PopupMenu();
  menu.attach(node, goog.positioning.Corner.BOTTOM_START);
  menu.setToggleMode(true);
  menu.render();

  this.fileMenu = new cwc.ui.FileMenu(this.helper);
  this.fileMenu.decorate(menu);

  if (this.helper.debugEnabled('EXAMPLES')) {
    this.exampleMenu = new cwc.ui.ExampleMenu(this.helper);
    this.exampleMenu.decorate(menu);
  }

  menu.addChild(new goog.ui.Separator, true);
  menu.addChild(this.menuExit, true);

};


/**
 * Decorates the help menu.
 * @param {Element} node
 * @private
 */
cwc.ui.Menubar.prototype.decorateHelpMenu_ = function(node) {
  if (!node) {
    console.log('Was not able to decorate help menu!');
    return;
  }

  var menu = new goog.ui.PopupMenu();
  var helpMenu = new cwc.HelpMenu(this.helper);
  var menuFirstSteps = cwc.ui.Helper.getMenuItem('First Steps',
      helpMenu.showFirstSteps, this);
  var menuHelp = cwc.ui.Helper.getMenuItem('Help',
      helpMenu.showHelp, this);
  var menuShortcuts = cwc.ui.Helper.getMenuItem('Keyboard Shortcuts',
      helpMenu.showKeyboardShortcut, this);
  var menuAbout = cwc.ui.Helper.getMenuItem('About Coding with Chrome',
      helpMenu.showAbout, this);
  var menuDebug = cwc.ui.Helper.getMenuItem('Debug',
        helpMenu.showDebug, this);
  menu.attach(node, goog.positioning.Corner.BOTTOM_START);
  menu.addChild(menuFirstSteps, true);
  menu.addChild(new goog.ui.Separator, true);
  menu.addChild(menuHelp, true);
  menu.addChild(menuShortcuts, true);
  menu.addChild(new goog.ui.Separator, true);
  menu.addChild(menuAbout, true);
  if (this.helper.debugEnabled()) {
    menu.addChild(menuDebug, true);
  }
  menu.setToggleMode(true);
  menu.render();
};


/**
 * Sets authentication for the current view.
 * @param {boolean} auth Determinate if user is authentificated.
 */
cwc.ui.Menubar.prototype.setAuthenticated = function(auth) {
  if (this.fileMenu) {
    this.fileMenu.setAuthenticated(auth);
  }
  goog.style.setElementShown(this.nodeAccountLogin, !auth);
  goog.style.setElementShown(this.nodeAccountLogout, auth);
};


/**
 * Logs in into Google Account for gDrive integration.
 */
cwc.ui.Menubar.prototype.loginAccount = function() {
  var accountInstance = this.helper.getInstance('account', true);
  accountInstance.authenticate();
};


/**
 * Logs out of current Google Account.
 */
cwc.ui.Menubar.prototype.logoutAccount = function() {
  var accountInstance = this.helper.getInstance('account', true);
  accountInstance.deauthenticate();
};


/**
 * Shows new file dialog.
 */
cwc.ui.Menubar.prototype.requestShowSelectScreen = function() {
  var selectScreenInstance = this.helper.getInstance('selectScreen');
  if (selectScreenInstance) {
    selectScreenInstance.requestShowSelectScreen();
  }
};


/**
 * Request to close the editor window.
 */
cwc.ui.Menubar.prototype.requestCloseWindow = function() {
  this.helper.handleUnsavedChanges(this.closeWindow.bind(this));
};


/**
 * Close editor window.
 */
cwc.ui.Menubar.prototype.closeWindow = function() {
  console.log('Close Coding with Chrome editor …');
  chrome.app.window.current().close();
};


/**
* @param {cwc.protocol.bluetooth.Device} device
* @export
*/
cwc.ui.Menubar.prototype.updateDeviceList = function(device) {
  if (this.deviceMenu) {
    this.deviceMenu.updateDeviceList(device);
  }
};


/**
 * @param {boolean} enabled Determine if Bluetooth is enabled.
 * @export
 */
cwc.ui.Menubar.prototype.setBluetoothEnabled = function(enabled) {
  if (this.helper.checkChromeFeature('bluetooth')) {
    goog.style.setElementShown(this.nodeBluetooth, enabled);
    goog.style.setElementShown(this.nodeBluetoothConnected, false);
    goog.style.setElementShown(this.nodeBluetoothDisabled, !enabled);
  }
};


/**
 * @param {boolean} connected Determine if any Bluetooth devices are connected.
 * @export
 */
cwc.ui.Menubar.prototype.setBluetoothConnected = function(connected) {
  if (this.helper.checkChromeFeature('bluetooth')) {
    goog.style.setElementShown(this.nodeBluetooth, !connected);
    goog.style.setElementShown(this.nodeBluetoothConnected, connected);
    goog.style.setElementShown(this.nodeBluetoothDisabled, !connected);
  }
};


/**
 * @param {Event=} opt_event
 * @private
 */
cwc.ui.Menubar.prototype.checkBluetoothState_ = function(opt_event) {
  this.helper.showInfo('Checking bluetooth state ...');
  var bluetoothInstance = this.helper.getInstance('bluetooth');
  if (bluetoothInstance) {
    bluetoothInstance.updateAdapterState();
  }
};
