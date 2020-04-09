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

    function objects(config) {
        RED.nodes.createNode(this,config);

        this.name          = config.objects_name;
        this.operation     = config.objects_operation;
        this.bucket        = config.objects_bucket;
        this.object        = config.objects_object;
        this.offset        = config.objects_offset;
        this.length        = config.objects_length;
        this.stream        = config.objects_stream;
        this.size          = config.objects_size;
        this.metadata      = config.objects_metadata;
        this.sourceobject  = config.objects_sourceobject;
        this.conditions    = config.objects_conditions;
        this.objectslist   = config.objects_objectslist;

        var node = this;

        var opParams = {
            'bucketName'   : node.bucket,
            'objectName'   : node.object,
            'offset'       : node.offset,
            'length'       : node.length,
            'stream'       : node.stream,
            'size'         : node.size,
            'metaData'     : node.metadata,
            'sourceObject' : node.sourceobject,
            'conditions'   : node.conditions,
            'objectsList'  : node.objectslist           
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
            opParams.objectName   = (msg.objectName) ? msg.objectName : opParams.objectName;
            opParams.offset       = (msg.offset) ? msg.offset : opParams.offset;
            opParams.length       = (msg.length) ? msg.length : opParams.length;
            opParams.stream       = (msg.stream) ? msg.stream : opParams.stream;
            opParams.size         = (msg.size) ? msg.size : opParams.size;
            opParams.metaData     = (msg.metaData) ? msg.metaData : opParams.metaData;
            opParams.sourceObject = (msg.sourceObject) ? msg.sourceObject : opParams.sourceObject;
            opParams.conditions   = (msg.conditions) ? msg.conditions : opParams.conditions;
            opParams.objectsList  = (msg.objectsList) ? msg.objectsList : opParams.objectsLista;
            
            // Trigger Bucket Operation type based on "operation" selected in node configuration
            switch (node.operation) {                
                
                // ====  GET OBJECT  ===================================================
                case "getObject":
                    // LIFTED STRAIGHT FROM SPEC - TO BE COMPLETED:
                    var size = 0
                    minioClient.getObject('mybucket', 'photo.jpg', function(err, dataStream) {
                        if (err) {
                            return console.log(err)
                        }
                        dataStream.on('data', function(chunk) {
                            size += chunk.length
                        })
                        dataStream.on('end', function() {
                            console.log('End. Total size = ' + size)
                        })
                        dataStream.on('error', function(err) {
                            console.log(err)
                        })
                    })
                    break;

                // ====  GET PARTIAL OBJECT  ===========================================
                case "getPartialObject":
                    // LIFTED STRAIGHT FROM SPEC - TO BE COMPLETED:
                    var size = 0
                    // reads 30 bytes from the offset 10.
                    minioClient.getPartialObject('mybucket', 'photo.jpg', 10, 30, function(err, dataStream) {
                        if (err) {
                            return console.log(err)
                        }
                        dataStream.on('data', function(chunk) {
                            size += chunk.length
                        })
                        dataStream.on('end', function() {
                            console.log('End. Total size = ' + size)
                        })
                        dataStream.on('error', function(err) {
                            console.log(err)
                        })
                    })
                    break;

                // ====  PUT OBJECT  ===================================================
                case "putObject":
                    // LIFTED STRAIGHT FROM SPEC - TO BE COMPLETED:
                    // As a stream:
                    var Fs = require('fs')
                    var file = '/tmp/40mbfile'
                    var fileStream = Fs.createReadStream(file)
                    var fileStat = Fs.stat(file, function(err, stats) {
                        if (err) {
                            return console.log(err)
                        }
                        minioClient.putObject('mybucket', '40mbfile', fileStream, stats.size, function(err, etag) {
                            return console.log(err, etag) // err should be null
                        })
                    })
                    
                    
                    // Or as a string or buffer:
                    var buffer = 'Hello World'
                    minioClient.putObject('mybucket', 'hello-file', buffer, function(err, etag) {
                        return console.log(err, etag) // err should be null
                    })
                    break;

                // ====  COPY OBJECT  ==================================================
                case "copyObject":
                    // LIFTED STRAIGHT FROM SPEC - TO BE COMPLETED:
                    var conds = new Minio.CopyConditions()
                    conds.setMatchETag('bd891862ea3e22c93ed53a098218791d')
                    minioClient.copyObject('mybucket', 'newobject', '/mybucket/srcobject', conds, function(e, data) {
                        if (e) {
                            return console.log(e)
                        }
                        console.log("Successfully copied the object:")
                        console.log("etag = " + data.etag + ", lastModified = " + data.lastModified)
                    })                
                    break;

                // ====  STAT OBJECT  ==================================================
                case "statObject":
                    // LIFTED STRAIGHT FROM SPEC - TO BE COMPLETED:
                    minioClient.statObject('mybucket', 'photo.jpg', function(err, stat) {
                        if (err) {
                            return console.log(err)
                        }
                        console.log(stat)
                    })
                    break;

                // ====  REMOVE OBJECT  ================================================
                case "removeObject":
                    // LIFTED STRAIGHT FROM SPEC - TO BE COMPLETED:
                    minioClient.removeObject('mybucket', 'photo.jpg', function(err) {
                        if (err) {
                            return console.log('Unable to remove object', err)
                        }
                        console.log('Removed the object')
                    })
                    break;

                // ====  REMOVE OBJECTS  ===============================================
                case "removeObjects":
                    // LIFTED STRAIGHT FROM SPEC - TO BE COMPLETED:
                    var objectsList = []

                    // List all object paths in bucket my-bucketname.
                    var objectsStream = s3Client.listObjects('my-bucketname', 'my-prefixname', true)
                    
                    objectsStream.on('data', function(obj) {
                        objectsList.push(obj.name);
                    })
                    
                    objectsStream.on('error', function(e) {
                        console.log(e);
                    })
                    
                    objectsStream.on('end', function() {
                    
                        s3Client.removeObjects('my-bucketname',objectsList, function(e) {
                            if (e) {
                                return console.log('Unable to remove Objects ',e)
                            }
                            console.log('Removed the objects successfully')
                        })
                    
                    })
                    break;

                // ====  REMOVE INCOMPLETE UPLOAD  =====================================
                case "removeIncompleteUpload":
                    // LIFTED STRAIGHT FROM SPEC - TO BE COMPLETED:
                    minioClient.removeIncompleteUpload('mybucket', 'photo.jpg', function(err) {
                        if (err) {
                            return console.log('Unable to remove incomplete object', err)
                        }
                        console.log('Incomplete object removed successfully.')
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
    RED.nodes.registerType("objects",objects);
}