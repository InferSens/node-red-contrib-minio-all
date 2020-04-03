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
    const helpers  = require('./helpers');

    function Buckets(config) {
        RED.nodes.createNode(this,config);

        this.name        = config.name;
        this.operation   = config.operation;
        this.bucket      = config.bucket;
        this.region      = config.region;
        this.prefix      = config.prefix;
        this.recursive   = config.recursive;
        this.start_after = config.start_after;

        var node = this;

        var opParams = {
            'bucketName' : node.bucket,
            'region'     : node.region,
            'prefix'     : node.prefix,
            'recursive'  : node.recursive,
            'startAfter' : node.start_after
        }

        console.log('node.operation:', node.operation);

        // retrive the values from the minio-config node
        node.minioInstance = RED.nodes.getNode(config.host);

        console.log('node.minioInstance:', node.minioInstance);

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
            opParams.bucketName = (msg.bucketName) ? msg.bucketName : opParams.bucketName;
            opParams.region = (msg.region) ? msg.region : opParams.region;
            opParams.prefix = (msg.prefix) ? msg.prefix : opParams.prefix;
            opParams.recursive = (msg.recursive) ? msg.recursive : opParams.recursive;
            opParams.startAfter = (msg.startAfter) ? msg.startAfter : opParams.startAfter;
            
            // Trigger Bucket Operation type based on "operation" selected in node configuration
            switch (node.operation) {                
                // ====  MAKE BUCKET  ===========================================
                case "makeBucket":
                    minioClient.makeBucket('mybucket', 'us-east-1', function(err) {
                        if (err) return console.log('Error creating bucket.', err)
                        console.log('Bucket created successfully in "us-east-1".')
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
                    minioClient.bucketExists('mybucket', function(err, exists) {
                        if (err) {
                            return console.log(err)
                        }
                        if (exists) {
                            return console.log('Bucket exists.')
                        }
                    })                    
                    break;
                // ====  REMOVE BUCKET  ===========================================
                case "removeBucket":
                    minioClient.removeBucket('mybucket', function(err) {
                        if (err) return console.log('unable to remove bucket.')
                        console.log('Bucket removed successfully.')
                    })
                    break;
                // ====  LIST OBJECTS  ===========================================
                case "listObjects":
                    var stream = minioClient.listObjects('mybucket','', true)
                    stream.on('data', function(obj) { console.log(obj) } )
                    stream.on('error', function(err) { console.log(err) } )
                    break;
                // ====  LIST OBJECTS V2  ===========================================
                case "listObjectsV2":
                    var stream = minioClient.listObjectsV2('mybucket','', true,'')
                    stream.on('data', function(obj) { console.log(obj) } )
                    stream.on('error', function(err) { console.log(err) } )
                    break;
                // ====  LIST OBJECTS V2 WITH META DATA  ===========================================
                case "listObjectsV2WithMetadata":
                    var stream = minioClient.extensions.listObjectsV2WithMetadata('mybucket','', true,'')
                    stream.on('data', function(obj) { console.log(obj) } )
                    stream.on('error', function(err) { console.log(err) } )
                    break;
                // ====  LIST INCOMPLETE UPLOADS  ===========================================
                case "listIncompleteUploads":
                    var Stream = minioClient.listIncompleteUploads('mybucket', '', true)
                    Stream.on('data', function(obj) {
                        console.log(obj)
                    })
                    Stream.on('end', function() {
                        console.log('End')
                    })
                    Stream.on('error', function(err) {
                        console.log(err)
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