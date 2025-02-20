/**
 * @fileoverview Handles the communication with the EV3 unit.
 *
 * This api allows to read and control the Lego Mindstorm EV3 sensors and
 * actors over an Bluetooth connection.
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
goog.provide('cwc.protocol.ev3.Api');

goog.require('cwc.protocol.bluetooth.Api');
goog.require('cwc.protocol.ev3.Buffer');
goog.require('cwc.protocol.ev3.ColorSensorMode');
goog.require('cwc.protocol.ev3.Command');
goog.require('cwc.protocol.ev3.Device');
goog.require('cwc.protocol.ev3.DeviceName');
goog.require('cwc.protocol.ev3.DeviceType');
goog.require('cwc.protocol.ev3.Events');
goog.require('cwc.protocol.ev3.InputPort');
goog.require('cwc.protocol.ev3.IrSensorMode');
goog.require('cwc.protocol.ev3.LedColor');
goog.require('cwc.protocol.ev3.LedMode');
goog.require('cwc.protocol.ev3.Monitoring');
goog.require('cwc.protocol.ev3.MotorMode');
goog.require('cwc.protocol.ev3.OutputPort');
goog.require('cwc.protocol.ev3.Polarity');

goog.require('cwc.utils.Helper');
goog.require('cwc.utils.StackEntry');

goog.require('goog.Timer');
goog.require('goog.events');
goog.require('goog.events.EventTarget');



/**
 * @param {!cwc.utils.Helper} helper
 * @constructor
 * @struct
 * @final
 */
cwc.protocol.ev3.Api = function(helper) {
  /** @type {string} */
  this.name = 'EV3';

  /** @type {number} */
  this.stepSpeed = 40;

  /** @type {number} */
  this.stepRotationRatio45 = 6.3;

  /** @type {number} */
  this.stepRotationRatio90 = 6.4;

  /** @type {number} */
  this.stepRotationRatio180 = 6.5;

  /** @type {number} */
  this.stepRotationRatio360 = 6.6;

  /** @type {boolean} */
  this.prepared = false;

  /** @type {string} */
  this.autoConnectName = 'EV3';

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {cwc.protocol.bluetooth.Device} */
  this.device = null;

  /** @private {!array} */
  this.header_ = [0xff, 0xff];

  /** @private {!number} */
  this.headerMinSize_ = 5;

  /** @type {Object} */
  this.deviceInfo = {};

  /** @type {Object} */
  this.deviceData = {};

  /** @type {!string} */
  this.firmware = '';

  /** @type {!string} */
  this.battery = '';

  /** @type {goog.events.EventTarget} */
  this.eventHandler = new goog.events.EventTarget();

  /** @type {cwc.protocol.ev3.Monitoring} */
  this.monitoring = new cwc.protocol.ev3.Monitoring(this);

  /** @type {!cwc.protocol.ev3.CallbackType} */
  this.callbackType = cwc.protocol.ev3.CallbackType;

  /** @type {!cwc.protocol.ev3.CallbackType} */
  this.callbackType = cwc.protocol.ev3.CallbackType;

  /** @type {!cwc.protocol.ev3.ColorSensorMode} */
  this.colorSensorMode = cwc.protocol.ev3.ColorSensorMode;

  /** @type {!cwc.protocol.ev3.CallbackType} */
  this.callbackType = cwc.protocol.ev3.CallbackType;

  /** @type {!cwc.protocol.ev3.Command} */
  this.command = cwc.protocol.ev3.Command;

  /** @type {!cwc.protocol.ev3.DeviceName} */
  this.deviceName = cwc.protocol.ev3.DeviceName;

  /** @type {!cwc.protocol.ev3.DeviceType} */
  this.deviceType = cwc.protocol.ev3.DeviceType;

  /** @type {!cwc.protocol.ev3.Events} */
  this.events = cwc.protocol.ev3.Events;

  /** @type {!cwc.protocol.ev3.InputPort} */
  this.inputPort = cwc.protocol.ev3.InputPort;

  /** @type {!cwc.protocol.ev3.IrSensorMode} */
  this.irSensorMode = cwc.protocol.ev3.IrSensorMode;

  /** @type {!cwc.protocol.ev3.LedColor} */
  this.ledColor = cwc.protocol.ev3.LedColor;

  /** @type {!cwc.protocol.ev3.LedMode} */
  this.ledMode = cwc.protocol.ev3.LedMode;

  /** @type {!cwc.protocol.ev3.MotorMode} */
  this.motorMode = cwc.protocol.ev3.MotorMode;

  /** @type {!cwc.protocol.ev3.OutputPort} */
  this.outputPort = cwc.protocol.ev3.OutputPort;

  /** @type {!cwc.protocol.ev3.Polarity} */
  this.polarity = cwc.protocol.ev3.Polarity;
};


/**
 * AutoConnects the EV3 unit.
 * @export
 */
cwc.protocol.ev3.Api.prototype.autoConnect = function() {
  var bluetoothInstance = this.helper.getInstance('bluetooth', true);
  bluetoothInstance.autoConnectDevice(this.autoConnectName,
      this.connect.bind(this));
};


/**
 * Connects the EV3 unit.
 * @param {!string} address
 * @return {boolean} Was able to prepare and connect to the EV3.
 * @export
 */
cwc.protocol.ev3.Api.prototype.connect = function(address) {
  var bluetoothInstance = this.helper.getInstance('bluetooth', true);
  var device = bluetoothInstance.getDevice(address);
  if (!device) {
    console.error('EV3 unit is not ready yet …');
    return false;
  }

  if (!this.prepared && device.isConnected()) {
    console.log('Prepare EV3 bluetooth api for', device.getAddress());
    this.device = device;
    this.prepare();
  }

  return true;
};


/**
 * @return {boolean}
 */
cwc.protocol.ev3.Api.prototype.isConnected = function() {
  return this.device && this.device.isConnected();
};


/**
 * @export
 */
cwc.protocol.ev3.Api.prototype.prepare = function() {
  this.device.setDataHandler(this.handleOnReceive_.bind(this));
  //this.device.setDataHandler(this.handleOnReceive_.bind(this),
  //    this.header_, this.headerMinSize_);
  this.monitoring.init();
  this.playTone(2000, 200, 25);
  this.getFirmware();
  this.getDevices();
  this.playTone(3000, 200, 50);
  this.prepared = true;
};


/**
 * Disconnects the EV3 unit.
 */
cwc.protocol.ev3.Api.prototype.disconnect = function() {
  if (this.device) {
    this.device.disconnect();
  }
  this.cleanUp();
};


/**
 * Resets the Sphero ball connection.
 * @param {number=} opt_delay
 */
cwc.protocol.ev3.Api.prototype.reset = function(opt_delay) {
  if (this.device) {
    this.device.reset(opt_delay);
  }
};


/**
 * @return {boolean}
 */
cwc.protocol.ev3.Api.prototype.isConnected = function() {
  return this.device && this.device.isConnected();
};


/**
 * Basic cleanup for the EV3 unit.
 */
cwc.protocol.ev3.Api.prototype.cleanUp = function() {
  this.stop();
  this.clear();
};


/**
 * @return {Object}
 */
cwc.protocol.ev3.Api.prototype.getDeviceData = function() {
  return this.deviceData;
};


/**
 * @return {Object}
 */
cwc.protocol.ev3.Api.prototype.getDeviceInfo = function() {
  return this.deviceInfo;
};


/**
 * @return {Object}
 */
cwc.protocol.ev3.Api.prototype.getColorSensorData = function() {
  return this.deviceData[this.deviceInfo[this.deviceName.COLOR_SENSOR]];
};


/**
 * @return {Object}
 */
cwc.protocol.ev3.Api.prototype.getIrSensorData = function() {
  return this.deviceData[this.deviceInfo[this.deviceName.IR_SENSOR]];
};


/**
 * @return {Object}
 */
cwc.protocol.ev3.Api.prototype.getTouchSensorData = function() {
  return this.deviceData[this.deviceInfo[this.deviceName.TOUCH_SENSOR]];
};


/**
 * @return {goog.events.EventTarget}
 */
cwc.protocol.ev3.Api.prototype.getEventHandler = function() {
  return this.eventHandler;
};


/**
 * @param {cwc.protocol.ev3.ColorSensorMode} mode
 */
cwc.protocol.ev3.Api.prototype.setColorSensorMode = function(mode) {
  this.deviceData[this.deviceInfo[this.deviceName.COLOR_SENSOR]].setMode(mode);
  this.deviceData[this.deviceInfo[this.deviceName.COLOR_SENSOR]].setCss(
      (mode == this.colorSensorMode.COLOR) ? 'color' : 'default');
};


/**
 * @param {cwc.protocol.ev3.IrSensorMode} mode
 */
cwc.protocol.ev3.Api.prototype.setIrSensorMode = function(mode) {
  this.deviceData[this.deviceInfo[this.deviceName.IR_SENSOR]].setMode(mode);
};


/**
 * @param {!number} speed
 */
cwc.protocol.ev3.Api.prototype.setStepSpeed = function(speed) {
  console.log('Set default step speed to', speed);
  this.stepSpeed = speed;
};


/**
 * Detects all connected devices.
 */
cwc.protocol.ev3.Api.prototype.getDevices = function() {
  this.monitoring.stop();

  // Sensor ports
  this.getDeviceType(this.inputPort.ONE);
  this.getDeviceType(this.inputPort.TWO);
  this.getDeviceType(this.inputPort.THREE);
  this.getDeviceType(this.inputPort.FOUR);

  // Actor ports
  this.getDeviceType(this.inputPort.A);
  this.getDeviceType(this.inputPort.B);
  this.getDeviceType(this.inputPort.C);
  this.getDeviceType(this.inputPort.D);
};


/**
 * Reads current EV3 battery level.
 * @param {number=} opt_delay
 */
cwc.protocol.ev3.Api.prototype.getBattery = function(opt_delay) {
  var buffer = new cwc.protocol.ev3.Buffer(0x10, 0, this.callbackType.BATTERY);
  buffer.writeCommand(this.command.UI.READ.BATTERY);
  buffer.writeIndex();
  this.send_(buffer, opt_delay);
};


/**
 * Reads current EV3 firmware.
 * @param {number=} opt_delay
 */
cwc.protocol.ev3.Api.prototype.getFirmware = function(opt_delay) {
  var buffer = new cwc.protocol.ev3.Buffer(0x10, 0, this.callbackType.FIRMWARE);
  buffer.writeCommand(this.command.UI.READ.FIRMWARE);
  buffer.writeByte(0x10);
  buffer.writeIndex();
  this.send_(buffer, opt_delay);
};


/**
 * Reads the device type.
 * @param {!cwc.protocol.ev3.InputPort} port
 * @param {number=} opt_delay
 * @export
 */
cwc.protocol.ev3.Api.prototype.getDeviceType = function(port, opt_delay) {
  var buffer = new cwc.protocol.ev3.Buffer(0x7F, 0,
      this.callbackType.DEVICE_NAME);
  buffer.writeCommand(this.command.INPUT.DEVICE.GETDEVICENAME);
  buffer.writeNullByte();
  buffer.writePort(port);
  buffer.writeByte(0x7F);
  buffer.writeIndex();
  this.send_(buffer, opt_delay);
};


/**
 * Gets the current data of the device.
 * @param {!cwc.protocol.ev3.InputPort} port
 * @param {number=} opt_delay
 * @export
 */
cwc.protocol.ev3.Api.prototype.getSensorData = function(port, opt_delay) {
  if (!(port in this.deviceData)) {
    return;
  }
  var device = this.deviceData[port];
  var buffer = new cwc.protocol.ev3.Buffer(0x04, 0,
      this.callbackType.DEVICE_SI_VALUE);
  buffer.writeCommand(this.command.INPUT.DEVICE.READSI);
  buffer.writeNullByte();
  buffer.writePort(port);
  buffer.writeNullByte();
  buffer.writeByte(device.getMode());
  buffer.writeSingleByte();
  buffer.writeIndex();
  this.send_(buffer, opt_delay);
};


/**
 * Get the current data of the device in Pct.
 * @param {!cwc.protocol.ev3.InputPort} port
 * @param {number=} opt_delay
 * @export
 */
cwc.protocol.ev3.Api.prototype.getSensorDataPct = function(port, opt_delay) {
  if (!(port in this.deviceData)) {
    return;
  }
  var device = this.deviceData[port];
  var buffer = new cwc.protocol.ev3.Buffer(0x04, 0,
      this.callbackType.DEVICE_PCT_VALUE);
  buffer.writeCommand(this.command.INPUT.DEVICE.READPCT);
  buffer.writeNullByte();
  buffer.writePort(port);
  buffer.writeNullByte();
  buffer.writeByte(device.getMode());
  buffer.writeSingleByte();
  buffer.writeIndex();
  this.send_(buffer, opt_delay);
};


/**
 * Get the current data of the device.
 * @param {!cwc.protocol.ev3.InputPort} port
 * @param {number=} opt_delay
 * @export
 */
cwc.protocol.ev3.Api.prototype.getActorData = function(port, opt_delay) {
  if (!(port in this.deviceData)) {
    return;
  }
  var device = this.deviceData[port];
  var buffer = new cwc.protocol.ev3.Buffer(0x04, 0,
      this.callbackType.ACTOR_VALUE);
  buffer.writeCommand(this.command.INPUT.DEVICE.READSI);
  buffer.writeNullByte();
  buffer.writePort(port);
  buffer.writeNullByte();
  buffer.writeByte(device.getMode());
  buffer.writeSingleByte();
  buffer.writeIndex();
  this.send_(buffer, opt_delay);
};


/**
 * @param {cwc.protocol.ev3.LedColor} color
 * @param {cwc.protocol.ev3.LedMode=} opt_mode
 * @param {number=} opt_delay
 */
cwc.protocol.ev3.Api.prototype.setLed = function(color, opt_mode, opt_delay) {
  var led = color + (opt_mode || 0);
  var buffer = new cwc.protocol.ev3.Buffer();
  buffer.writeCommand(this.command.UI.WRITE.LED);
  buffer.writeByte(led);
  this.send_(buffer, opt_delay);
};


/**
 * @param {!number} power
 * @param {boolean=} opt_invert Inverts the motor directions.
 * @param {number=} opt_delay
 */
cwc.protocol.ev3.Api.prototype.movePower = function(power, opt_invert,
    opt_delay) {
  var brake = 1;
  var ports = this.outputPort.B | this.outputPort.C;
  var buffer = new cwc.protocol.ev3.Buffer();
  buffer.writeCommand(this.command.OUTPUT.STOP);
  buffer.writeNullByte();
  buffer.writePorts(ports);
  buffer.writeByte(brake);
  buffer.writeCommand(this.command.OUTPUT.POWER);
  buffer.writeNullByte();
  buffer.writePorts(ports);
  buffer.writeByte((opt_invert) ? -power : power);
  buffer.writeCommand(this.command.OUTPUT.START);
  buffer.writeNullByte();
  buffer.writePorts(ports);
  this.send_(buffer, opt_delay);
};


/**
 * @param {!number} power Main power value.
 * @param {number=} opt_power Optional second power value.
 * @param {boolean=} opt_invert Inverts the motor directions.
 * @param {number=} opt_delay
 */
cwc.protocol.ev3.Api.prototype.rotatePower = function(power, opt_power,
    opt_invert, opt_delay) {
  var brake = 1;
  var power1 = (opt_invert) ? -power : power;
  var power2 = ((opt_invert) ? opt_power : -opt_power) || -power1;
  var ports = this.outputPort.B | this.outputPort.C;
  var buffer = new cwc.protocol.ev3.Buffer();
  buffer.writeCommand(this.command.OUTPUT.STOP);
  buffer.writeNullByte();
  buffer.writePorts(ports);
  buffer.writeByte(brake);
  buffer.writeCommand(this.command.OUTPUT.POWER);
  buffer.writeNullByte();
  buffer.writePort(this.outputPort.B);
  buffer.writeByte(power1);
  buffer.writeCommand(this.command.OUTPUT.POWER);
  buffer.writeNullByte();
  buffer.writePort(this.outputPort.C);
  buffer.writeByte(power2);
  buffer.writeCommand(this.command.OUTPUT.START);
  buffer.writeNullByte();
  buffer.writePorts(ports);
  this.send_(buffer, opt_delay);
};


/**
 * @param {cwc.protocol.ev3.InputPort=} opt_port
 * @param {number=} opt_delay
 */
cwc.protocol.ev3.Api.prototype.stop = function(opt_port, opt_delay) {
  var brake = 1;
  var buffer = new cwc.protocol.ev3.Buffer();
  buffer.writeCommand(this.command.OUTPUT.STOP);
  buffer.writeNullByte();
  buffer.writePorts(opt_port || this.outputPort.ALL);
  buffer.writeByte(brake);
  this.send_(buffer, opt_delay);
  this.reset(opt_delay);
};


/**
 * Clears the EV3 unit.
 * @param {number=} opt_delay
 * @export
 */
cwc.protocol.ev3.Api.prototype.clear = function(opt_delay) {
  var buffer = new cwc.protocol.ev3.Buffer();
  buffer.writeCommand(this.command.INPUT.DEVICE.CLEARALL);
  buffer.writeNullByte();
  this.send_(buffer, opt_delay);
};


/**
 * Shows the selected image file.
 * @param {!string} file_name
 * @param {number=} opt_delay
 * @export
 */
cwc.protocol.ev3.Api.prototype.showImage = function(file_name, opt_delay) {
  var buffer = new cwc.protocol.ev3.Buffer();
  buffer.writeCommand(this.command.UI.DRAW.BMPFILE);
  buffer.writeString(file_name);
  this.send_(buffer, opt_delay);
};


/**
 * Plays a tone with the defined volume, frequency and duration.
 * @param {!number} frequency
 * @param {number=} opt_duration
 * @param {number=} opt_volume
 * @param {number=} opt_delay
 * @export
 */
cwc.protocol.ev3.Api.prototype.playTone = function(frequency, opt_duration,
    opt_volume, opt_delay) {
  var duration = Math.max(opt_duration, 50) || 50;
  var volume = Math.min(opt_volume || 100, 100);
  var buffer = new cwc.protocol.ev3.Buffer();
  buffer.writeCommand(this.command.SOUND.TONE);
  buffer.writeByte(volume);
  buffer.writeShort(frequency);
  buffer.writeShort(duration);
  this.send_(buffer, opt_delay);
};


/**
 * Plays the selected sound file.
 * @param {!string} file_name
 * @param {number=} opt_volume
 * @param {number=} opt_delay
 * @export
 */
cwc.protocol.ev3.Api.prototype.playSound = function(file_name, opt_volume,
    opt_delay) {
  var buffer = new cwc.protocol.ev3.Buffer();
  buffer.writeCommand(this.command.SOUND.PLAY);
  buffer.writeByte(Math.min(100, Math.max(0, opt_volume)));
  buffer.writeString(file_name);
  this.send_(buffer, opt_delay);
};


/**
 * Moves the servo motor for the predefined specific steps.
 * @param {!number} steps
 * @param {boolean=} opt_invert Inverts the motor directions.
 * @param {number=} opt_step_speed
 * @param {number=} opt_delay
 * @export
 */
cwc.protocol.ev3.Api.prototype.moveServo = function(steps, opt_invert,
    opt_speed, opt_delay) {
  var brake = 1;
  var speed = (opt_invert) ? this.stepSpeed * -1 : this.stepSpeed;
  var port = this.outputPort.A;
  var rampUp = 0;
  var rampDown = 0;
  var buffer = new cwc.protocol.ev3.Buffer();
  buffer.writeCommand(this.command.OUTPUT.STOP);
  buffer.writeNullByte();
  buffer.writePort(port);
  buffer.writeByte(brake);
  buffer.writeCommand(this.command.OUTPUT.STEP.SPEED);
  buffer.writeNullByte();
  buffer.writePort(port);
  buffer.writeByte(speed);
  buffer.writeInt(rampUp);
  buffer.writeInt(steps);
  buffer.writeInt(rampDown);
  buffer.writeByte(brake);
  this.send_(buffer, opt_delay);
};


/**
 * Moves the motors for the predefined specific steps.
 * @param {!number} steps
 * @param {boolean=} opt_invert Inverts the motor directions.
 * @param {number=} opt_step_speed
 * @param {number=} opt_delay
 * @export
 */
cwc.protocol.ev3.Api.prototype.moveSteps = function(steps, opt_invert,
    opt_step_speed, opt_delay) {
  var speed = (opt_invert) ? this.stepSpeed * -1 : this.stepSpeed;
  var ports = this.outputPort.B | this.outputPort.C;
  var rampUp = 0;
  var rampDown = 0;
  var brake = 1;
  var buffer = new cwc.protocol.ev3.Buffer();
  buffer.writeCommand(this.command.OUTPUT.STOP);
  buffer.writeNullByte();
  buffer.writePorts(ports);
  buffer.writeByte(brake);
  buffer.writeCommand(this.command.OUTPUT.STEP.SPEED);
  buffer.writeNullByte();
  buffer.writePorts(ports);
  buffer.writeByte(speed);
  buffer.writeInt(rampUp);
  buffer.writeInt(steps);
  buffer.writeInt(rampDown);
  buffer.writeByte(brake);
  this.send_(buffer, opt_delay);
};


/**
 * Rotates the motors for the predefined specific steps.
 * @param {!number} angle
 * @param {boolean=} opt_invert Inverts the motor directions.
 * @param {number=} opt_step_speed
 * @param {number=} opt_angle_ratio
 * @param {number=} opt_delay
 * @export
 */
cwc.protocol.ev3.Api.prototype.rotateAngle = function(angle, opt_invert,
    opt_step_speed, opt_angle_ratio, opt_delay) {
  var ratio = opt_angle_ratio;
  if (!ratio) {
    if (angle <= 45) {
      ratio = this.stepRotationRatio45;
    } else if (angle <= 90) {
      ratio = this.stepRotationRatio90;
    } else if (angle <= 180) {
      ratio = this.stepRotationRatio180;
    } else {
      ratio = this.stepRotationRatio360;
    }
  }
  var steps = ratio * angle;
  var speed = (opt_invert) ? this.stepSpeed * -1 : this.stepSpeed;
  var rampUp = 0;
  var rampDown = 0;
  var brake = 1;
  var ports = this.outputPort.B | this.outputPort.C;
  var buffer = new cwc.protocol.ev3.Buffer();
  buffer.writeCommand(this.command.OUTPUT.STOP);
  buffer.writeNullByte();
  buffer.writePorts(ports);
  buffer.writeByte(brake);
  buffer.writeCommand(this.command.OUTPUT.STEP.SPEED);
  buffer.writeNullByte();
  buffer.writePort(this.outputPort.B);
  buffer.writeByte(speed);
  buffer.writeInt(rampUp);
  buffer.writeInt(steps);
  buffer.writeInt(rampDown);
  buffer.writeByte(brake);
  buffer.writeCommand(this.command.OUTPUT.STEP.SPEED);
  buffer.writeNullByte();
  buffer.writePort(this.outputPort.C);
  buffer.writeByte(-speed);
  buffer.writeInt(rampUp);
  buffer.writeInt(steps);
  buffer.writeInt(rampDown);
  buffer.writeByte(brake);
  this.send_(buffer, opt_delay);
};


/**
 * @param {!cwc.protocol.ev3.Buffer} buffer
 * @param {number=} opt_delay
 * @private
 */
cwc.protocol.ev3.Api.prototype.send_ = function(buffer, opt_delay) {
  if (!this.device) {
    return;
  }
  var data = buffer.readSigned();
  if (opt_delay) {
    this.device.sendDelayed(data, opt_delay);
  } else {
    this.device.send(data);
  }
};


/**
 * @param {!cwc.protocol.ev3.InputPort} port
 * @param {!string} type
 * @private
 */
cwc.protocol.ev3.Api.prototype.updateDeviceType_ = function(port, type) {
  if (type == this.deviceType.NONE) {
    return;
  }
  var typeNormalized = type.replace(/-/g, '_');
  if (!(typeNormalized in this.deviceType)) {
    if (type == 'PORT ERROR') {
      console.error('Recieved Port Error on port', port, '!');
      console.error('PLEASE RESTART THE EV3 TO FIX THIS ERROR !');
    } else {
      console.warn('Unknown device type "', type, '" on port', port, '!');
    }
    return;
  }
  var deviceTypeName = this.deviceType[typeNormalized];
  var deviceName = deviceTypeName;
  var deviceMode = 0;
  var deviceCss = '';
  var sensorGroup = true;
  switch (deviceTypeName) {
    case this.deviceType.IR_PROX:
      deviceName = this.deviceName.IR_SENSOR;
      deviceMode = this.irSensorMode.PROXIMITY;
      break;
    case this.deviceType.IR_SEEK:
      deviceName = this.deviceName.IR_SENSOR;
      deviceMode = this.irSensorMode.SEEK;
      break;
    case this.deviceType.IR_REMOTE:
      deviceName = this.deviceName.IR_SENSOR;
      deviceMode = this.irSensorMode.REMOTECONTROL;
      break;
    case this.deviceType.TOUCH:
      deviceName = this.deviceName.TOUCH_SENSOR;
      break;
    case this.deviceType.COL_REFLECT:
      deviceName = this.deviceName.COLOR_SENSOR;
      deviceMode = this.colorSensorMode.REFLECTIVE;
      break;
    case this.deviceType.COL_AMBIENT:
      deviceName = this.deviceName.COLOR_SENSOR;
      deviceMode = this.colorSensorMode.AMBIENT;
      break;
    case this.deviceType.COL_COLOR:
      deviceName = this.deviceName.COLOR_SENSOR;
      deviceMode = this.colorSensorMode.COLOR;
      deviceCss = 'color';
      break;
    case this.deviceType.L_MOTOR_DEG:
      deviceName = this.deviceName.LARGE_MOTOR;
      deviceMode = this.motorMode.DEGREE;
      sensorGroup = false;
      break;
    case this.deviceType.L_MOTOR_ROT:
      deviceName = this.deviceName.LARGE_MOTOR;
      deviceMode = this.motorMode.ROTATION;
      sensorGroup = false;
      break;
    case this.deviceType.M_MOTOR_DEG:
      deviceName = this.deviceName.MEDIUM_MOTOR;
      deviceMode = this.motorMode.DEGREE;
      sensorGroup = false;
      break;
    case this.deviceType.M_MOTOR_ROT:
      deviceName = this.deviceName.MEDIUM_MOTOR;
      deviceMode = this.motorMode.ROTATION;
      sensorGroup = false;
      break;
  }

  if (deviceName in this.deviceInfo && this.deviceInfo[deviceName] != port) {
    if (deviceName == this.deviceName.LARGE_MOTOR) {
      deviceName = this.deviceName.LARGE_MOTOR_OPT;
    } else if (deviceName == this.deviceName.MEDIUM_MOTOR) {
      deviceName = this.deviceName.MEDIUM_MOTOR_OPT;
    }
  }

  console.log('Found', deviceName, 'with mode', deviceMode, 'on port', port);
  this.deviceData[port] = new cwc.protocol.ev3.Device(deviceName,
      deviceMode, 0, deviceCss);
  this.eventHandler.dispatchEvent(
      new this.events.ChangedDevices(this.deviceData));

  if (sensorGroup) {
    this.deviceInfo[deviceName] = port;
    this.getSensorData(port);
  } else {
    this.deviceInfo[deviceName] = port;
    this.getActorData(port);
  }
  this.monitoring.start(this.deviceInfo);
};


/**
 * @param {!cwc.protocol.ev3.InputPort} port
 * @param {!number} value
 * @param {cwc.protocol.ev3.DeviceName=} opt_device_name
 * @private
 */
cwc.protocol.ev3.Api.prototype.updateDeviceData_ = function(port, value,
    opt_device_name) {
  if (this.deviceData[port] && this.deviceData[port].getValue() != value) {
    this.deviceData[port].setValue(value);
    this.monitoring.update();
    switch (opt_device_name) {
      case this.deviceName.COLOR_SENSOR:
        this.eventHandler.dispatchEvent(
            this.events.ColorSensorValue(value, port));
        break;
      case this.deviceName.IR_SENSOR:
        this.eventHandler.dispatchEvent(
            this.events.IrSensorValue(value, port));
        break;
      case this.deviceName.TOUCH_SENSOR:
        this.eventHandler.dispatchEvent(
            this.events.TouchSensorValue(value, port));
        break;
      case this.deviceName.LARGE_MOTOR:
        this.eventHandler.dispatchEvent(
            this.events.TouchSensorValue(value, port));
        break;
      case this.deviceName.MEDIUM_MOTOR:
        this.eventHandler.dispatchEvent(
            this.events.MediumMotorValue(value, port));
        break;
      case this.deviceName.LARGE_MOTOR_OPT:
        this.eventHandler.dispatchEvent(
            this.events.LargeMotorOptValue(value, port));
        break;
      case this.deviceName.MEDIUM_MOTOR_OPT:
        this.eventHandler.dispatchEvent(
            this.events.MediumMotorOptValue(value, port));
        break;
    }
  }
};


/**
 * Handles received data and callbacks from the Bluetooth socket.
 * @param {Array<number>|ArrayBuffer|ArrayBufferView|null|number} raw_data
 * @private
 */
cwc.protocol.ev3.Api.prototype.handleOnReceive_ = function(raw_data) {
  if (!raw_data) {
    console.error('Recieved no data!');
    return;
  }
  var data = data = new Uint8Array(raw_data);
  if (data.length < 5) {
    console.error('Recieved data are to small!');
    return;
  }

  var value = 0;
  var result = 0;
  var callback = data[2];
  var port = data[3];

  // Handles the different callback types.
  switch (callback) {
    case this.callbackType.FIRMWARE:
      value = data.subarray(5, 5 + 16);
      this.firmware = (String.fromCharCode.apply(null, value)).trim();
      console.log('EV3 Firmware Version', this.firmware);
      break;
    case this.callbackType.BATTERY:
      value = data.subarray(5, 5 + 16);
      this.battery = value;
      console.log('EV3 Battery level', this.battery);
      break;
    case this.callbackType.DEVICE_NAME:
      value = data.subarray(5, 5 + 0x7E);
      var type = (String.fromCharCode.apply(null, value)).trim();
      this.updateDeviceType_(port, type);
      break;
    case this.callbackType.DEVICE_SI_VALUE:
    case this.callbackType.DEVICE_PCT_VALUE:
      value = data[5];
      this.updateDeviceData_(port, value, this.deviceData[port].getName());
      break;
    case this.callbackType.ACTOR_VALUE:
      value = new Uint8Array([data[5], data[6], data[7], data[8]]);
      result = new Int32Array(value.buffer)[0];
      this.updateDeviceData_(port, result, this.deviceData[port].getName());
      break;
  }
};
