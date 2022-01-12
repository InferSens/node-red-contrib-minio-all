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

module.exports = function(RED) {
    const helpers = require('./helpers');

    function files(config) {
        RED.nodes.createNode(this,config);

        this.name      = config.files_name;
        this.operation = config.files_operation;
        this.bucket    = config.files_bucket;
        this.object    = config.files_object;
        this.file_path = config.files_filepath;
        this.meta_data = config.files_metadata;

        var node = this;

        var opParams = {
            'bucketName' : node.bucket,
            'objectName' : node.object,
            'filePath'   : node.file_path,
            'metaData'   : node.meta_data
        }

        // retrive the values from the minio-config node
        node.minioInstance = RED.nodes.getNode(config.host);

        if (node.minioInstance) {
            var minioClient = node.minioInstance.initialize();
        }
 
        // TRIGGER ON INCOMING MESSAGE
        node.on('input', function(msg) {
            // If values are provided in the incoming message, then they override those set in the node configuration
            node.operation = (msg.operation) ? msg.operation : node.operation;
            opParams.bucketName = (msg.bucketName) ? msg.bucketName : opParams.bucketName;
            opParams.objectName = (msg.objectName) ? msg.objectName : opParams.objectName;
            opParams.filePath = (msg.filePath) ? msg.filePath : opParams.filePath;
            opParams.metaData = (msg.metaData) ? msg.metaData : opParams.metaData;
            
            // Trigger Bucket Operation type based on "operation" selected in node configuration
            switch (node.operation) {                
                
                // ====  FILE GET OBJECT  ===========================================
                case "fGetObject":
                    helpers.statusUpdate(node, "blue", "dot", 'Getting object "' + opParams.objectName + '"');
                    minioClient.fGetObject(opParams.bucketName, opParams.objectName, opParams.filePath, function(err) {
                        if (err) {
                            node.output = { 'fGetObject': false };
                            node.error = err;
                            helpers.statusUpdate(node, "red", "dot", 'Error', 5000);
                        } else {
                            node.output = { 'fGetObject': true };
                            node.error = null;
                            helpers.statusUpdate(node, "green", "dot", 'Get object "' + opParams.objectName + '" successful', 3000);
                        }
                    })
                    break;

                // ====  FILE PUT OBJECT  ===========================================
                case "fPutObject":
                    if (opParams.metaData) {
                        helpers.statusUpdate(node, "blue", "dot", 'Putting object "' + opParams.objectName + '"');
                        minioClient.fPutObject(opParams.bucketName, opParams.objectName, opParams.filePath, opParams.metaData, function(err, etag) {
                            if (err) {
                                node.output = { 'fPutObject': false };
                                node.error = err;
                                helpers.statusUpdate(node, "red", "dot", 'Error', 5000);
                            } else {
                                node.output = { 'fPutObject': true, 'etag': etag };
                                node.error = null;
                                helpers.statusUpdate(node, "green", "dot", 'Put object "' + opParams.objectName + '" successful', 3000);
                            }
                        })
                    } else {
                        helpers.statusUpdate(node, "blue", "dot", 'Putting object "' + opParams.objectName + '"');
                        minioClient.fPutObject(opParams.bucketName, opParams.objectName, opParams.filePath, function(err, etag) {
                            if (err) {
                                node.output = { 'fPutObject': false };
                                node.error = err;
                                helpers.statusUpdate(node, "red", "dot", 'Error', 5000);
                            } else {
                                node.output = { 'fPutObject': true, 'etag': etag };
                                node.error = null;
                                helpers.statusUpdate(node, "green", "dot", 'Put object "' + opParams.objectName + '" successful', 3000);
                            }
                        })
                    }
                    break;

                // ====  DEFAULT - INCORRECT SELECTION   ===========================================
                case "default":
                    node.error = 'Invalid File Object Operation Selection'
                    node.output = null;
            }

            // Waits until response received from host before sending to node output(s)
            var timerId = setTimeout(function check() {
                if (!node.output) { timerId = setTimeout(check, 50); } else {
                    const msgArray = helpers.buildOutMessage(RED, msg, node.output, node.error);
                    node.send(msgArray);
                }
            }, 50);

        });
        
    }
    RED.nodes.registerType("files",files);
}