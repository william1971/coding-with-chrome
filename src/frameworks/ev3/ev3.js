/**
 * @fileoverview EV3 framework for the runner instance.
 * This EV3 framework will be used by the runner instance, inside the webview
 * sandbox, to access the EV3 over the runner instance and the Bluetooth
 * interface.
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
goog.provide('cwc.framework.Ev3');

goog.require('cwc.framework.Runner');
goog.require('cwc.protocol.ev3.DeviceName');
goog.require('cwc.protocol.ev3.LedColor');
goog.require('cwc.protocol.ev3.LedMode');



/**
 * @constructor
 * @param {!Function} code
 * @struct
 * @final
 * @export
 */
cwc.framework.Ev3 = function(code) {
  /** @type {string} */
  this.name = 'EV3 Framework';

  /** @type {Function} */
  this.code = function() {code(this);}.bind(this);

  /** @type {!cwc.framework.Runner} */
  this.runner = new cwc.framework.Runner(this.code);

  /** @type {Object} */
  this.deviceData = {};

  /** @type {Object} */
  this.deviceInfo = {};

  /** @type {Object} */
  this.colorSensorData = null;

  /** @type {Object} */
  this.irSensorData = null;

  /** @type {Object} */
  this.touchSensorData = null;

  /** @type {!function(?)} */
  this.colorSensorEvent = function() {};

  /** @type {!function(?)} */
  this.touchSensorEvent = function() {};

  /** @type {!function(?)} */
  this.irSensorEvent = function() {};

  /** @type {number} */
  this.colorSensorValue = null;

  /** @type {number} */
  this.touchSensorValue = null;

  /** @type {number} */
  this.irSensorValue = null;

  this.runner.addCommand(
      'updateDeviceData', this.handleUpdateDeviceData_, this);
  this.runner.addCommand(
      'updateDeviceInfo', this.handleUpdateDeviceInfo_, this);

  this.runner.addCommand('updateIrSensor', this.handleUpdateIrSensor_, this);
  this.runner.addCommand(
      'updateColorSensor', this.handleUpdateColorSensor_, this);
  this.runner.addCommand(
      'updateTouchSensor', this.handleUpdateTouchSensor_, this);
};


/**
 * Returns the Color Sensor object.
 * @return {Object}
 * @export
 */
cwc.framework.Ev3.prototype.getColorSensor = function() {
  return this.colorSensorData;
};


/**
 * Returns the Touch object.
 * @return {Object}
 * @export
 */
cwc.framework.Ev3.prototype.getTouchSensor = function() {
  return this.touchSensorData;
};


/**
 * Returns the IR object.
 * @return {Object}
 * @export
 */
cwc.framework.Ev3.prototype.getIrSensor = function() {
  return this.irSensorData;
};


/**
 * Returns the Color Sensor value.
 * @return {number}
 * @export
 */
cwc.framework.Ev3.prototype.getColorSensorValue = function() {
  return this.colorSensorValue;
};


/**
 * Returns the Touch value.
 * @return {number}
 * @export
 */
cwc.framework.Ev3.prototype.getTouchSensorValue = function() {
  return this.touchSensorValue;
};


/**
 * Returns the IR object.
 * @return {number}
 * @export
 */
cwc.framework.Ev3.prototype.getIrSensorValue = function() {
  return this.irSensorValue;
};


/**
 * Returns the data for the given interface name.
 * @param {!string} port
 * @return {Object}
 * @export
 */
cwc.framework.Ev3.prototype.getInterface = function(port) {
  if (port in this.deviceData) {
    return this.deviceData[port];
  }
  return null;
};


/**
 * @param {!Function} func
 * @export
 */
cwc.framework.Ev3.prototype.onColorSensorChange = function(func) {
  if (goog.isFunction(func)) {
    this.colorSensorEvent = func;
  }
};


/**
 * @param {!Function} func
 * @export
 */
cwc.framework.Ev3.prototype.onTouchSensorChange = function(func) {
  if (goog.isFunction(func)) {
    this.touchSensorEvent = func;
  }
};


/**
 * @param {!Function} func
 * @export
 */
cwc.framework.Ev3.prototype.onIrSensorChange = function(func) {
  if (goog.isFunction(func)) {
    this.irSensorEvent = func;
  }
};


/**
 * Displays the selected file name on the EV3 display.
 * @param {!string} file_name
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.showImage = function(file_name, opt_delay) {
  this.runner.send('showImage', {'file': file_name, 'delay': opt_delay });
};


/**
 * Plays tone.
 * @param {!number} frequency
 * @param {number=} opt_duration
 * @param {number=} opt_volume
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.playTone = function(frequency, opt_duration,
    opt_volume, opt_delay) {
  this.runner.send('playTone', {
    'frequency': frequency,
    'duration': opt_duration,
    'volume': opt_volume,
    'delay': opt_delay });
};


/**
 * Plays a sound file.
 * @param {!string} file_name
 * @param {number=} opt_volume
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.playSound = function(file_name, opt_volume,
    opt_delay) {
  this.runner.send('playSound', {
    'file': file_name,
    'volume': opt_volume,
    'delay': opt_delay });
};


/**
 * Moves the servo motor for the predefined specific steps.
 * @param {!number} steps
 * @param {boolean=} opt_invert Inverts the motor directions.
 * @param {number=} opt_speed
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.moveServo = function(steps, opt_invert,
    opt_speed, opt_delay) {
  this.runner.send('moveServo', {
    'steps': steps,
    'invert': opt_invert,
    'speed': opt_speed,
    'delay': opt_delay });
};


/**
 * Moves the motors for the predefined specific steps.
 * @param {!number} steps
 * @param {boolean=} opt_invert Inverts the motor directions.
 * @param {number=} opt_speed
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.moveSteps = function(steps, opt_invert,
    opt_speed, opt_delay) {
  this.runner.send('moveSteps', {
    'steps': steps,
    'speed': opt_speed,
    'invert': opt_invert,
    'delay': opt_delay });
};


/**
 * Rotates the motors for the predefined specific steps.
 * @param {!number} angle
 * @param {boolean=} opt_invert Inverts the motor directions.
 * @param {number=} opt_speed
 * @param {number=} opt_ratio
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.rotateAngle = function(angle, opt_invert, opt_speed,
    opt_ratio, opt_delay) {
  this.runner.send('rotateAngle', {
    'angle': angle,
    'invert': opt_invert,
    'speed': opt_speed,
    'ratio': opt_ratio,
    'delay': opt_delay });
};


/**
 * Moves forward / backward with power.
 * @param {!number} power
 * @param {boolean=} opt_invert Inverts the motor directions.
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.movePower = function(power, opt_invert,
    opt_delay) {
  this.runner.send('movePower', {
    'power': power,
    'invert': opt_invert,
    'delay': opt_delay });
};


/**
 * Rotates left / right with power.
 * @param {!number} power General power value.
 * @param {number=} opt_power Dedicated power value for the second motor.
 * @param {boolean=} opt_invert Inverts the motor directions.
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.rotatePower = function(power, opt_power,
    opt_invert, opt_delay) {
  this.runner.send('rotatePower', {
    'power': power,
    'opt_power': opt_power,
    'invert': opt_invert,
    'delay': opt_delay });
};


/**
 * Stops all motors.
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.stop = function(opt_delay) {
  this.runner.send('stop', {'delay': opt_delay });
};


/**
 * @param {!number} mode
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.setColorSensorMode = function(mode, opt_delay) {
  this.runner.send('setColorSensorMode', {'mode': mode, 'delay': opt_delay });
};


/**
 * @param {!number} mode
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.setIrSensorMode = function(mode, opt_delay) {
  this.runner.send('setIrSensorMode', {'mode': mode, 'delay': opt_delay });
};


/**
 * @param {cwc.protocol.ev3.LedColor} color
 * @param {cwc.protocol.ev3.LedMode=} opt_mode
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.setLed = function(color, opt_mode, opt_delay) {
  this.runner.send('setLed', {
    'color': color,
    'mode': opt_mode,
    'delay': opt_delay });
};


/**
 * @param {!number} speed
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.Ev3.prototype.setStepSpeed = function(speed, opt_delay) {
  this.runner.send('setStepSpeed', {'speed': speed, 'delay': opt_delay });
};


/**
 * Updates the current sensor / actor states with the received data.
 * @param {Object} data
 * @private
 */
cwc.framework.Ev3.prototype.handleUpdateDeviceData_ = function(data) {
  for (var device_name in this.deviceInfo) {
    var devicePort = this.deviceInfo[device_name];
    if (!(devicePort in this.deviceData) ||
        this.deviceData[devicePort].value != data[devicePort].value) {
      this.deviceData[devicePort] = data[devicePort];
      switch (device_name) {
        case cwc.protocol.ev3.DeviceName.IR_SENSOR:
          this.irSensorData = data[devicePort];
          break;
        case cwc.protocol.ev3.DeviceName.COLOR_SENSOR:
          this.colorSensorData = data[devicePort];
          break;
        case cwc.protocol.ev3.DeviceName.TOUCH_SENSOR:
          this.touchSensorData = data[devicePort];
          break;
      }
    }
  }
  this.deviceData = data;
};


/**
 * Updates the current sensor / actor states with the received data.
 * @param {Object} data
 * @private
 */
cwc.framework.Ev3.prototype.handleUpdateDeviceInfo_ = function(data) {
  this.deviceInfo = data;
};


/**
 * @param {!number} data
 * @private
 */
cwc.framework.Ev3.prototype.handleUpdateIrSensor_ = function(data) {
  this.irSensorValue = data;
  this.irSensorEvent(data);
};


/**
 * @param {!number} data
 * @private
 */
cwc.framework.Ev3.prototype.handleUpdateColorSensor_ = function(data) {
  this.colorSensorValue = data;
  this.colorSensorEvent(data);
};


/**
 * @param {!number} data
 * @private
 */
cwc.framework.Ev3.prototype.handleUpdateTouchSensor_ = function(data) {
  this.touchSensorValue = data;
  this.touchSensorEvent(data);
};
