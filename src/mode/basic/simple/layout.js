/**
 * @fileoverview Layout for the Basic simple modification.
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
goog.provide('cwc.mode.basic.simple.Layout');

goog.require('cwc.soy.mode.Basic.simple');



/**
 * @constructor
 * @param {!cwc.utils.Helper} helper
 */
cwc.mode.basic.simple.Layout = function(helper) {
  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.prefix = helper.getPrefix();
};


/**
 * Decorates the basic simple layout.
 */
cwc.mode.basic.simple.Layout.prototype.decorate = function() {
  var layoutInstance = this.helper.getInstance('layout', true);
  layoutInstance.decorateSimpleTwoColumnLayout(500);
  var nodes = layoutInstance.getNodes();

  console.log('Adding Content');
  goog.soy.renderElement(
      nodes['content-left'],
      cwc.soy.mode.Basic.simple.editor,
      {'prefix': this.prefix}
  );

  goog.soy.renderElement(
      nodes['content-right'],
      cwc.soy.mode.Basic.simple.preview,
      {'prefix': this.prefix}
  );

};
