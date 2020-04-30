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

var Minio = require('minio');

const helpers = require('./helpers');

module.exports = function(RED) {

    function MinioConfigNode(config) {

        RED.nodes.createNode(this,config);
        this.name =   config.name;
	    this.host =   config.host;
	    this.port =   parseInt(config.port);
        this.useSsl = config.useSsl;

        var node = this;

        // Prevents a limit being placed on number of event listeners (otherwise max of 10 by default):
        node.setMaxListeners(0);

        node.initialize = function() {

            try {

                this.minioClient = new Minio.Client({
                    endPoint: this.host,
                    port: this.port,
                    useSSL: this.useSsl,
                    accessKey: this.credentials.accessKey,
                    secretKey: this.credentials.secretKey
                });
    
    
                return this.minioClient;    
            }
            catch(err) {
                console.log(err);
            }
        }

        node.on('close', function(){
            node.removeAllListeners("minio_status");
		});
    }

    RED.nodes.registerType("minio-config",MinioConfigNode,{
        credentials: {
            accessKey: {type:"text"},
            secretKey: {type:"password"}
        }
    });
}