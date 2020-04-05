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

    function Presigned(config) {
        RED.nodes.createNode(this,config);

        this.name         = config.name;
        this.operation    = config.operation;
        this.bucket       = config.bucket;
        this.object       = config.object;
        this.expiry       = config.expiry;
        this.req_params   = config.req_params;
        this.resp_headers = config.resp_headers;
        this.issue        = config.issue;
        this.policy       = config.policy;

        var node = this;

        var opParams = {
            'bucketName' : node.bucket,
            'objectName' : node.object,
            'expiry'     : parseInt(node.expiry),
            'reqParams'  : node.req_params,
            'respHeaders': node.resp_headers,
            'requestDate': node.issue,
            'policy'     : node.policy
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

            // console.log('node.minioClient =', minioClient );
        }

        // TRIGGER ON INCOMING MESSAGE
        node.on('input', function(msg) {
            // If values are provided in the incoming message, then they override those in the node configuration
            node.operation = (msg.operation) ? msg.operation : node.operation;
            opParams.bucketName = (msg.bucketName) ? msg.bucketName : opParams.bucketName;
            opParams.objectName = (msg.objectName) ? msg.objectName : opParams.objectName;
            opParams.expiry = (msg.expiry) ? msg.expiry : opParams.expiry;
            opParams.reqParams = (msg.reqParams) ? msg.reqParams : opParams.reqParams;
            opParams.respHeaders = (msg.respHeaders) ? msg.respHeaders : opParams.respHeaders;
            opParams.requestDate = (msg.requestDate) ? msg.requestDate : opParams.requestDate;
            opParams.policy = (msg.policy) ? msg.policy : opParams.policy;
            
            // Trigger Presigned Operation type based on "operation" selected in node configuration
            switch (node.operation) {                
                // ====  PRESIGNED URL  ===========================================
                case "presignedURL":
                    // minioClient.presignedUrl('GET', opParams.bucketName, opParams.objectName, opParams.expiry, opParams.reqParams, function(err, presignedUrl) {
                    minioClient.presignedUrl('GET', opParams.bucketName, opParams.objectName, opParams.expiry, function(err, presignedUrl) {
                        node.error = (err) ? err : null;
                        node.output = { 'presignedURL': presignedUrl };
                    })
                    break;
                // ====  PRESIGNED GET OBJECT  ===========================================
                case "presignedGetObject":
                    minioClient.presignedGetObject(opParams.bucketName, opParams.objectName, opParams.expiry, function(err, presignedUrl) {
                        node.error = (err) ? err : null;
                        node.output = { 'presignedGetObject': presignedUrl };
                    })
                    break;
                // ====  PRESIGNED PUT OBJECT  ===========================================
                case "presignedPutObject":
                    minioClient.presignedPutObject(opParams.bucketName, opParams.objectName, opParams.expiry, function(err, presignedUrl) {
                        node.error = (err) ? err : null;
                        node.output = { 'presignedPutObject': presignedUrl };
                    })                    
                    break;
                // ====  PRESIGNED POLICY OPERATION  ===========================================
                case "presignedPostPolicy":
                    minioClient.presignedPostPolicy(opParams.bucketName, opParams.objectName, opParams.expiry, function(err, presignedUrl) {
                        node.error = (err) ? err : null;
                        node.output = { 'presignedPostPolicy': presignedUrl };
                    })                    
                    break;
                // ====  DEFAULT - INCORRECT SELECTION   ===========================================
                case "default":
                    node.error = 'Invalid Presigned Operation Selection'
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
    RED.nodes.registerType("presigned",Presigned);
}