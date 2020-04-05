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

    function Buckets(config) {
        RED.nodes.createNode(this,config);

        this.name        = config.buckets_name;
        this.operation   = config.buckets_operation;
        this.bucket      = config.buckets_bucket;
        this.region      = config.buckets_region;
        this.prefix      = config.buckets_prefix;
        this.recursive   = config.buckets_recursive;
        this.start_after = config.buckets_start_after;

        var node = this;

        var opParams = {
            'bucketName' : node.bucket,
            'region'     : node.region,
            'prefix'     : node.prefix,
            'recursive'  : node.recursive,
            'startAfter' : node.start_after
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
            opParams.region = (msg.region) ? msg.region : opParams.region;
            opParams.prefix = (msg.prefix) ? msg.prefix : opParams.prefix;
            // opParams.recursive = (msg.recursive) ? msg.recursive : opParams.recursive;
            opParams.recursive = (typeof msg.recursive === 'boolean') ? msg.recursive : opParams.recursive;
            opParams.startAfter = (msg.startAfter) ? msg.startAfter : opParams.startAfter;
            
            // Trigger Bucket Operation type based on "operation" selected in node configuration
            switch (node.operation) {                
                // ====  MAKE BUCKET  ===========================================
                case "makeBucket":
                    minioClient.makeBucket(opParams.bucketName, opParams.region, function(err) {
                        // if (err) return console.log('Error creating bucket.', err)
                        if (err) {
                            node.output = { 'makeBucket': false };
                            node.error = err;
                        } else {
                            node.output = { 'makeBucket': true };
                            node.error = null;
                        }
                        // console.log('Bucket created successfully in "us-east-1".')
                        // node.error = (err) ? err : null;
                        // node.output = { 'makeBucket': buckets };
                    })
                    break;
                // ====  LIST BUCKETS  ===========================================
                case "listBuckets":
                    minioClient.listBuckets(function(err, buckets) {
                        node.error = (err) ? err : null;
                        node.output = { 'listBuckets': buckets };
                    })
                    break;
                // ====  BUCKET EXISTS  ===========================================
                case "bucketExists":
                    minioClient.bucketExists(opParams.bucketName, function(err, exists) {
                        node.error = (err) ? err : null;
                        node.output = (exists) ? { 'bucketExists': true } : { 'bucketExists': false };
                    })                    
                    break;
                // ====  REMOVE BUCKET  ===========================================
                case "removeBucket":
                    minioClient.removeBucket(opParams.bucketName, function(err) {
                        node.error = (err) ? err : null;
                        node.output = (err) ? { 'removeBucket': false } : { 'removeBucket': true };
                    })
                    break;
                // ====  LIST OBJECTS  ===========================================
                case "listObjects":
                    var stream = minioClient.listObjects(opParams.bucketName,opParams.prefix, opParams.recursive)
                    var objects = [];
                    stream.on('data',  function(obj) { objects.push(obj) } );
                    stream.on('error', function(err) { node.error = err } );
                    stream.on('end',   function() { 
                        node.output = { 'listObjects': objects };
                        node.error = null;
                    })
                    break;
                // ====  LIST OBJECTS V2  ===========================================
                case "listObjectsV2":
                    var stream = minioClient.listObjectsV2(opParams.bucketName,opParams.prefix, opParams.recursive,opParams.startAfter)
                    var objects = [];
                    stream.on('data',  function(obj) { objects.push(obj) } );
                    stream.on('error', function(err) { node.error = err } );
                    stream.on('end',   function() { 
                        node.output = { 'listObjectsV2': objects };
                        node.error = null;
                    })
                    break;
                // ====  LIST OBJECTS V2 WITH META DATA  ===========================================
                case "listObjectsV2WithMetadata":
                    var stream = minioClient.extensions.listObjectsV2WithMetadata(opParams.bucketName,opParams.prefix, opParams.recursive,opParams.startAfter)
                    var objects = [];
                    stream.on('data',  function(obj) { objects.push(obj) } );
                    stream.on('error', function(err) { node.error = err } );
                    stream.on('end',   function() {
                        node.output = { 'listObjectsV2WithMetadata': objects },
                        node.error = null;
                    })
                    break;
                // ====  LIST INCOMPLETE UPLOADS  ===========================================
                case "listIncompleteUploads":
                    var stream = minioClient.listIncompleteUploads(opParams.bucketName, opParams.prefix, opParams.recursive)
                    // stream.on('data', function(obj) {
                    //     console.log(obj)
                    // })
                    // Stream.on('end', function() {
                    //     console.log('End')
                    // })
                    // Stream.on('error', function(err) {
                    //     console.log(err)
                    var objects = [];
                    stream.on('data',  function(obj) { objects.push(obj) } );
                    stream.on('error', function(err) { node.error = err } );
                    stream.on('end',   function() {
                        node.output = { 'listIncompleteUploads': objects },
                        node.error = null;
                    })
                    break;
                // ====  DEFAULT - INCORRECT SELECTION   ===========================================
                case "default":
                    node.error = 'Invalid Bucket Operation Selection'
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
    RED.nodes.registerType("buckets",Buckets);
}