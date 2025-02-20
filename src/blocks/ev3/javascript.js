/**
 * @fileoverview JavaScript for the EV3 blocks.
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
goog.provide('cwc.blocks.ev3.JavaScript');

goog.require('Blockly');
goog.require('Blockly.JavaScript');
goog.require('cwc.config.sound');


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_play_music_note'] = function(block) {
  var dropdown_note = block.getFieldValue('note');
  var text_duration = block.getFieldValue('duration');
  var text_volume = 100;
  var duration = Number(text_duration) * 1000 / cwc.config.sound.BPM;
  var code = 'ev3.playTone(' + Math.round(dropdown_note) + ', ' +
      Math.round(duration) + ', ' + text_volume + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_play_tone'] = function(block) {
  var text_frequency = block.getFieldValue('frequency');
  var text_duration = block.getFieldValue('duration');
  var text_volume = block.getFieldValue('volume');
  var code = 'ev3.playTone(' + text_frequency + ', ' + text_duration + ', ' +
      text_volume + ', ' + (Number(text_duration)) + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_move'] = function(block) {
  var dropdown_direction = block.getFieldValue('direction');
  var text_steps = block.getFieldValue('steps');
  var invert = dropdown_direction == 'backwards';
  var delay = Number(text_steps) * 5 ;
  var code = 'ev3.moveSteps(' + text_steps + ', null, ' + invert + ', ' +
      delay + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_move_forward'] = function(block) {
  var text_steps = block.getFieldValue('steps');
  var delay = Number(text_steps) * 5;
  var code = 'ev3.moveSteps(' + text_steps + ', null, false, ' + delay + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_move_backward'] = function(block) {
  var text_steps = block.getFieldValue('steps');
  var delay = Number(text_steps) * 5;
  var code = 'ev3.moveSteps(' + text_steps + ', null, true, ' + delay + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_move_pen'] = function(block) {
  var dropdown_direction = block.getFieldValue('direction');
  var text_steps = block.getFieldValue('steps');
  var invert = dropdown_direction == 'up';
  var delay = Number(text_steps) * 5;
  var code = 'ev3.moveServo(' + text_steps + ', ' + invert + ', null, ' +
      delay + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_move_servo'] = function(block) {
  var dropdown_direction = block.getFieldValue('direction');
  var text_steps = block.getFieldValue('steps');
  var invert = dropdown_direction == 'inverted';
  var delay = Number(text_steps) * 5;
  var code = 'ev3.moveServo(' + text_steps + ', ' + invert + ', null, ' +
      delay + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_rotate'] = function(block) {
  var dropdown_direction = block.getFieldValue('direction');
  var angle_value = block.getFieldValue('angle');
  var invert = dropdown_direction == 'left';
  var delay = (angle_value * 5) + 1250;
  var code = 'ev3.rotateAngle(' + angle_value + ', ' + invert +
      ', null, null, ' + delay + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_rotate_left'] = function(block) {
  var angle_value = block.getFieldValue('angle');
  var delay = (angle_value * 5) + 1250;
  var code = 'ev3.rotateAngle(' + angle_value + ', true, null, null, ' +
      delay + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_rotate_right'] = function(block) {
  var angle_value = block.getFieldValue('angle');
  var delay = (angle_value * 5) + 1250;
  var code = 'ev3.rotateAngle(' + angle_value + ', false, null, null, ' +
      delay + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_stop'] = function(block) {
  var dropdown_immediately = block.getFieldValue('immediately');
  var code = 'ev3.stop();\n';
  if (dropdown_immediately == 'when finished') {
    code = 'ev3.stop(500);\n';
  }
  return code;
};


/**
 * @param {!Blockly.Block=} opt_block
 * @return {string}
 */
Blockly.JavaScript['ev3_stop_immediately'] = function(opt_block) {
  var code = 'ev3.stop();\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_move_power'] = function(block) {
  var dropdown_direction = block.getFieldValue('direction');
  var value_power = block.getFieldValue('power');
  var invert = dropdown_direction == 'backwards';
  var code = 'ev3.movePower(' + value_power + ', ' + invert + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_rotate_power'] = function(block) {
  var dropdown_direction = block.getFieldValue('direction');
  var value_power = block.getFieldValue('power');
  var invert = dropdown_direction == 'left';
  var code = 'ev3.rotatePower(' + value_power + ', ' + value_power + ',' +
    invert + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_color_sensor_mode'] = function(block) {
  var dropdown_mode = block.getFieldValue('mode');
  var mode = 0;
  switch (dropdown_mode) {
    case 'reflection':
      mode = 0;
      break;
    case 'ambient light':
      mode = 1;
      break;
    case 'color':
      mode = 2;
      break;
  }
  var code = 'ev3.setColorSensorMode(' + mode + ');\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_ir_sensor_mode'] = function(block) {
  var dropdown_mode = block.getFieldValue('mode');
  var mode = 0;
  switch (dropdown_mode) {
    case 'proximity':
      mode = 0;
      break;
    case 'ir beacon':
      mode = 1;
      break;
    case 'ir remote':
      mode = 2;
      break;
  }
  var code = 'ev3.setIrSensorMode(' + mode + ');\n';
  return code;
};


/**
 * @param {Blockly.Block=} opt_block
 * @return {string}
 */
Blockly.JavaScript['ev3_color_sensor_value'] = function(opt_block) {
  var code = 'ev3.getColorSensorValue()';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


/**
 * @param {Blockly.Block=} opt_block
 * @return {string}
 */
Blockly.JavaScript['ev3_touch_sensor_value'] = function(opt_block) {
  var code = 'ev3.getTouchSensorValue()';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


/**
 * @param {Blockly.Block=} opt_block
 * @return {string}
 */
Blockly.JavaScript['ev3_ir_sensor_value'] = function(opt_block) {
  var code = 'ev3.getIrSensorValue()';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_color_sensor_change'] = function(block) {
  var statements_code = Blockly.JavaScript.statementToCode(block, 'CODE');
  var code = 'var colorSensorEvent = function(value) {\n' +
      statements_code + '};\nev3.onColorSensorChange(colorSensorEvent);\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_ir_sensor_change'] = function(block) {
  var statements_code = Blockly.JavaScript.statementToCode(block, 'CODE');
  var code = 'var irSensorEvent = function(value) {\n' +
      statements_code + '};\nev3.onIrSensorChange(irSensorEvent);\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_touch_sensor_change'] = function(block) {
  var statements_code = Blockly.JavaScript.statementToCode(block, 'CODE');
  var code = 'var touchEvent = function(value) {\n' +
      statements_code +
      '};\nev3.onTouchSensorChange(touchEvent);\n';
  return code;
};


/**
 * @param {!Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_on_collision_ir'] = function(block) {
  var statements_code1 = Blockly.JavaScript.statementToCode(block, 'CODE1');
  var statements_code2 = Blockly.JavaScript.statementToCode(block, 'CODE2');
  var value1 = block.getFieldValue('VALUE1');
  var value2 = block.getFieldValue('VALUE2');
  var code = 'var irSensorEvent = function(value) {\n' +
      'if(value > ' + value1 + ') {\n' +
      statements_code1 + '\n}\nelse if(value < ' +
      value2 + ') {\n' +
      statements_code2 + '\n}' +
      '};\nev3.onIrSensorChange(irSensorEvent);\n' +
      'ev3.setIrSensorMode(0);\n';
  return code;
};


/**
 * @param {Blockly.Block=} opt_block
 * @return {string}
 */
Blockly.JavaScript['ev3_variable_value'] = function(opt_block) {
  var code = 'value';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


/**
 * @param {Blockly.Block} block
 * @return {string}
 */
Blockly.JavaScript['ev3_led'] = function(block) {
  var dropdown_color = block.getFieldValue('color');
  var dropdown_mode = block.getFieldValue('mode');
  var color = 0;
  var mode = 0;
  switch (dropdown_color) {
    case 'green':
      color = 1;
      break;
    case 'red':
      color = 2;
      break;
    case 'orange':
      color = 3;
      break;
  }
  switch (dropdown_mode) {
    case 'flash':
      mode = 3;
      break;
    case 'pulse':
      mode = 6;
      break;
  }

  var code = 'ev3.setLed(' + color + ', ' + mode + ', 10);\n';
  return code;
};
