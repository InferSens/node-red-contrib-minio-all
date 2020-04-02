module.exports = function(RED) {
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

        // retrive the values from the minio-config node
        this.minioInstance = RED.nodes.getNode(config.host);

        console.log('this.minioInstance:', this.minioInstance)

        var node = this;
        // Test output on receipt of input message
        node.on('input', function(msg) {
            msg.payload = {
                "name":         this.name,
                "operation":    this.operation,
                "host":         this.minioInstance.host,
                "port":         this.minioInstance.port,
                "accessKey":    this.minioInstance.credentials.accessKey,
                "secretKey":    this.minioInstance.credentials.secretKey,
                "useSsl":       this.minioInstance.useSsl,
                "bucket":       this.bucket,
                "object":       this.object,
                "expiry":       this.expiry,
                "req_params":   this.req_params,
                "resp_headers": this.resp_headers,
                "issue":        this.issue,
                "policy":       this.policy
            }
            node.send(msg);
        });
    }

    RED.nodes.registerType("presigned",Presigned);
}