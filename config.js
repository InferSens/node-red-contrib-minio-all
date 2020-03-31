module.exports = function(RED) {
    function RemoteServerNode(n) {
        RED.nodes.createNode(this,n);
        this.accessKey = this.credentials.accessKey;
        this.secretKey = this.credentials.secretKey;
        this.name = n.name;
	    this.host = n.host;
	    this.port = n.port;
        this.useSsl = n.useSsl;
    }
    RED.nodes.registerType("minio config",RemoteServerNode,{credentials: {
         accessKey: {type:"text"},
         secretKey: {type:"password"}
     }});
}