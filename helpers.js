/**
 * Copyright © 2020 Colin Payne.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

/**
 * Take the input msg object, duplicate it, then set as payload the OK/Err responses 
 * received from the Minio call and return an array of msg [ okMsg, errMsg ]
 * @param {*} RED the node-red instance
 * @param {*} inputMessage the message in input to the node
 * @param {*} okPayload payload for OK respose
 * @param {*} errorPayload payload for Error response
 * @returns an array [ okMsg, errMsg ] containing the input message enriched with the 
 * result of the Minio call as payload
 */
exports.buildOutMessage = function(RED, inputMessage, okPayload, errorPayload) {
    inputMessage.payload = null; // Avoid cloning payload as it will be overwritten
    let errMsg = RED.util.cloneMessage(inputMessage);
    inputMessage.payload = okPayload;
    errMsg.payload = errorPayload;
    return [ inputMessage , errMsg ];
}

// ====  FUNCTION TO SET AND OPTIONALLY CLEAR A NODE'S STATUS  =================
// ----  Node Status Options:
// ----  FILL - red, green, yellow, blue or grey
// ----  SHAPE - ring or dot.
// ----  LINGER - Time in ms for message to be displayed. 0 = permanent
exports.statusUpdate = function(node, fill, shape, text, linger=0) {
    node.status({fill:fill,shape:shape,text:text});
    if (linger > 0) { // if 'linger' is > 0, then clear the status message after
                      // the period defined (in ms) by the 'linger' value
        setTimeout(function(){ node.status({}); }, linger);
    }
};


// ====  FUNCTION TO TOGGLE THE DISPLAY OF AN ARRAY OF ELEMENTS  ===============
// ====  NOT CURRENTLY USED/WORKING
exports.toggleVisibility = function(document, elementArray) {
    let element;
    for (element of elementArray) {
        let x = document.getElementById(element[0]);
        if (element[1]) {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    }
};
