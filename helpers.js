/**
 * Copyright 2020 Colin Payne.
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

exports.setStatus = function(node, minioStatus) {
    switch(minioStatus) {
        case "unconfigured":
            node.status({fill:"red",shape:"ring",text:minioStatus});
            break;
        case "conecting":
            node.status({fill:"yellow",shape:"dot",text:minioStatus});
            break;
        case "disconnected":
            node.status({fill:"red",shape:"ring",text:minioStatus});
            break;
        case "connected":
            node.status({fill:"green",shape:"dot",text:minioStatus});
            break;
        case "":
            node.status({});
            break;
        default:
            node.status({fill:"red",shape:"ring",text:"unknown"});
    }
};


// ====  FUNCTION TO TOGGLE THE DISPLAY OF AN ARRAY OF ELEMENTS  ========================
exports.toggleVisibility = function(elementArray) {
    let element;
    for (element of elementArray) {
        let x = document.getElementById(element[0]);
        if (element[1]) {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    }
}







// exports.handleResult = function(node, err, date, xml, newMsg) {
//     if (err) {
//         console.error(err.message);

//         var lowercase = err.message.toLowerCase();
        
//         // Sometimes the OnVif device responds with errors like "Method Not Found", "Action Not Implemented", ... 
//         // In that case we will show an error indicating that the action is not supported by the device.
//         if (lowercase.includes("not found") || lowercase.includes("not implemented")) {
//             node.status({fill:"red",shape:"dot",text: "unsupported action"});
//         }
//         else {
//             node.status({fill:"red",shape:"dot",text: "failed"});
//         }
//     }
//     else {
//         if (newMsg) {
//             newMsg.payload = date;
//             node.send(newMsg);
//         }
//     }
// }