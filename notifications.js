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

    function notifications(config) {
        RED.nodes.createNode(this,config);

        this.name               = config.notifications_name;
        this.operation          = config.notifications_operation;
        this.bucket             = config.notifications_bucket;
        this.notificationconfig = config.notifications_notificationconfig;
        this.prefix             = config.notifications_prefix;
        this.suffix             = config.notifications_suffix;
        this.events             = config.notifications_events;

        var node = this;

        var opParams = {
            'bucketName'               : node.bucket,
            'bucketNotificationConfig' : node.notificationconfig,
            'prefix'                   : node.prefix,
            'suffix'                   : node.suffix,
            'events'                   : node.events
        }

        // retrive the values from the minio-config node
        node.minioInstance = RED.nodes.getNode(config.host);

        if (node.minioInstance) {
            var minioClient = node.minioInstance.initialize();
        }
 
        // TRIGGER ON INCOMING MESSAGE
        node.on('input', function(msg) {
            // If values are provided in the incoming message, then they override those set in the node configuration
            node.operation                    = (msg.operation) ? msg.operation : node.operation;
            opParams.bucketName               = (msg.bucketName) ? msg.bucketName : opParams.bucketName;
            opParams.bucketNotificationConfig = (msg.bucketNotificationConfig) ? msg.bucketNotificationConfig : opParams.bucketNotificationConfig;
            opParams.prefix                   = (msg.prefix) ? msg.prefix : opParams.prefix;
            opParams.suffix                   = (msg.suffix) ? msg.suffix : opParams.suffix;
            opParams.events                   = (msg.events) ? msg.events : opParams.events;
            
            // Trigger Bucket Operation type based on "operation" selected in node configuration
            switch (node.operation) {                
                
                // ====  GET BUCKET NOTIFICATION  ===================================================
                case "getBucketNotification":
                    helpers.statusUpdate(node, "blue", "dot", 'Checking Bucket Notification Config...');
                    minioClient.getBucketNotification(opParams.bucketName, function(err, bucketNotificationConfig) {
                        if (err) {
                            helpers.statusUpdate(node, "red", "dot", 'Error', 5000);
                            node.output = { 'getBucketNotification': false };
                            node.error = err;
                        } else {
                            helpers.statusUpdate(node, "green", "dot", 'Returned Bucket Notification Config', 5000);
                            node.output = {
                                'getBucketNotification': true,
                                'config': bucketNotificationConfig
                            };
                            node.error = null;
                        }
                    })

                    break;

                // ====  SET BUCKET NOTIFICATION  ===========================================
                case "setBucketNotification":
                    // LIFTED STRAIGHT FROM SPEC - TO BE COMPLETED:

                    // Create a new notification object
                    var bucketNotification = new Minio.NotificationConfig();

                    // Setup a new Queue configuration
                    var arn = Minio.buildARN('aws', 'sqs', 'us-west-2', '1', 'webhook')
                    var queue = new Minio.QueueConfig(arn)
                    queue.addFilterSuffix('.jpg')
                    queue.addFilterPrefix('myphotos/')
                    queue.addEvent(Minio.ObjectReducedRedundancyLostObject)
                    queue.addEvent(Minio.ObjectCreatedAll)

                    // Add the queue to the overall notification object
                    bucketNotification.add(queue)

                    // THE FOLLOWING IS OK:    
                    minioClient.setBucketNotification(opParams.bucketName, bucketNotification, function(err) {
                        if (err) {
                            node.output = { 'setBucketNotification': false };
                            node.error = err;
                        } else {
                            node.output = { 'setBucketNotification': true };
                            node.error = null;
                        }
                    })

                    break;

                // ====  REMOVE ALL BUCKET NOTIFICATIONS  ===================================================
                case "removeAllBucketNotification":
                    // LIFTED STRAIGHT FROM SPEC - TO BE COMPLETED:
                    minioClient.removeAllBucketNotification('my-bucketname', function(err) {
                        if (err) {
                            node.output = { 'removeAllBucketNotification': false };
                            node.error = err;
                        } else {
                            node.output = { 'removeAllBucketNotification': true };
                            node.error = null;
                        }
                    })

                    break;

                // ====  LISTEN BUCKET NOTIFICATIONS  ==================================================
                case "listenBucketNotification":
                    // LIFTED STRAIGHT FROM SPEC - TO BE COMPLETED:
                    var listener = minioClient.listenBucketNotification('my-bucketname', 'photos/', '.jpg', ['s3:ObjectCreated:*'])
                    listener.on('notification', function(record) {
                        // For example: 's3:ObjectCreated:Put event occurred (2016-08-23T18:26:07.214Z)'
                        console.log('%s event occurred (%s)', record.eventName, record.eventTime)
                        listener.stop()
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
    RED.nodes.registerType("notifications",notifications);
}