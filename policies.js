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

module.exports = function(RED) {
    const helpers = require('./helpers');

    function policies(config) {
        RED.nodes.createNode(this,config);

        this.name      = config.policies_name;
        this.operation = config.policies_operation;
        this.bucket    = config.policies_bucket;
        this.policy    = config.policies_policy;

        var node = this;

        var opParams = {
            'bucketName'   : node.bucket,
            'bucketPolicy' : node.policy,
        }

        // retrive the values from the minio-config node
        node.minioInstance = RED.nodes.getNode(config.host);

        if (node.minioInstance) {
            node.listener = function(minioStatus) {
                helpers.setStatus(node, minioStatus);
            }
            
            // Start listening for MinIO config node status changes
            node.minioInstance.addListener("minio_status", node.listener);
            
            // Show the current MinIO config node status
            helpers.setStatus(node, node.minioInstance.minioStatus);
            
            var minioClient = node.minioInstance.initialize();
        }

        // TRIGGER ON INCOMING MESSAGE
        node.on('input', function(msg) {
            // If values are provided in the incoming message, then they override those set in the node configuration
            node.operation        = (msg.operation) ? msg.operation : node.operation;
            opParams.bucketName   = (msg.bucketName) ? msg.bucketName : opParams.bucketName;
            opParams.bucketPolicy = (msg.bucketPolicy) ? msg.bucketPolicy : opParams.bucketPolicy;
            
            // Trigger Bucket Operation type based on "operation" selected in node configuration
            switch (node.operation) {                
                
                // ====  GET BUCKET POLICY  ===================================================
                case "getBucketPolicy":
                    minioClient.getBucketPolicy(opParams.bucketName, function(err, policy) {
                        if (err) {
                            node.output = { 'getBucketPolicy': false };
                            node.error = err;
                        } else {
                            node.output = {
                                'getBucketPolicy': true,
                                'policy': policy
                            };
                            node.error = null;
                        }
                    })
                    
                    break;

                // ====  SET BUCKET POLICY  ===========================================
                case "setBucketPolicy":
                   minioClient.setBucketPolicy(opParams.bucketName, JSON.stringify(opParams.bucketPolicy), function(err) {
                        if (err) {
                            node.output = { 'setBucketPolicy': false };
                            node.error = err;
                        } else {
                            node.output = { 'setBucketPolicy': true };
                            node.error = null;
                        }
                    })

                    break;

                // ====  DEFAULT - INCORRECT SELECTION   ===============================
                case "default":
                    node.error = 'Invalid File Object Operation Selection'
                    node.output = null;
            }

            // Waits until response received from host before sending to node output(s)
            var timerId = setTimeout(function check() {
                if (!node.output) { timerId = setTimeout(check, 50); } else {
                    node.send([ { 'payload': node.output } , { 'payload': node.error } ]);
                }
            }, 50);

        });
        
    }
    RED.nodes.registerType("policies",policies);
}