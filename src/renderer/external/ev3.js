/**
 * @fileoverview EV3 renderer.
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
goog.provide('cwc.renderer.external.EV3');

goog.require('cwc.file.ContentType');
goog.require('cwc.file.Files');
goog.require('cwc.renderer.Helper');
goog.require('cwc.utils.Helper');



/**
 * @constructor
 * @param {!cwc.utils.Helper} helper
 * @struct
 * @final
 */
cwc.renderer.external.EV3 = function(helper) {
  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.customFramework = 'ev3_framework.js';

  /** @type {string} */
  this.runnerFramework = 'runner_framework.js';
};


/**
 * Initializes and defines the EV3 renderer.
 */
cwc.renderer.external.EV3.prototype.init = function() {
  var rendererInstance = this.helper.getInstance('renderer', true);
  var renderer = this.render.bind(this);
  rendererInstance.setRenderer(renderer);
};


/**
 * @param {Object} editor_content
 * @param {Object} editor_flags
 * @param {cwc.file.Files} library_files
 * @param {cwc.file.Files} frameworks
 * @param {cwc.renderer.Helper} renderer_helper
 * @return {string}
 * @export
 */
cwc.renderer.external.EV3.prototype.render = function(
    editor_content,
    editor_flags,
    library_files,
    frameworks,
    renderer_helper) {

  var header = '';
  var runnerFramework = frameworks.getFile(this.runnerFramework);
  if (runnerFramework) {
    var runner = runnerFramework.getContent();
    header += '<script src="' + runner + '"></script>';
  }

  var ev3Framework = frameworks.getFile(this.customFramework);
  if (ev3Framework) {
    var ev3 = ev3Framework.getContent();
    header += '<script src="' + ev3 + '"></script>';
  }

  var body = '\n<script>' +
      '  var code = function(ev3) {\n' +
      editor_content[cwc.file.ContentType.JAVASCRIPT] +
      '\n};\n' +
      '  new cwc.framework.Ev3(code);\n' +
      '</script>\n';

  var html = renderer_helper.getHTML(body, header);
  return html;
};
