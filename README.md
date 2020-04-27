# node-red-contrib-minio-all
NodeRed Node for common MinIO operations, by Colin Payne.

This node utilises the MinIO JavaScript API (please see https://docs.min.io/docs/javascript-client-api-reference.html).

**Please Note:**
This set of nodes (and associated support information) is a work in progress.

## MinIO Operations ##

[Bucket Operations](#bucket-operations) | [File Object Operations](#file-object-operations) | [Object Operations](#object-operations) 
:---------------------------- | :-------------------------------------- | :----------------------------
[makeBucket](#1-makebucket) | [fGetObject](#1-fgetobject) | [getObject](#1-getobject)
[listBuckets](#2-listbuckets) | [fPutObject](#2-fputobject) | [getPartialObject](#2-getpartialobject)
[bucketExists](#3-bucketexists) |   | [putObject](#3-putobject) | [presignedPutObject](#3-presignedputobject)
[removeBucket](#4-removebucket) |   | [copyObject](#4-copyobject) | [presignedPostPolicy](#4-presignedpostpolicy)
[listObjects](#5-listobjects) |   | [statObject](#5-statobject)
[listObjectsV2](#6-listobjectsv2) |   | [removeObject](#6-removeobject)
[listObjectsV2WithMetadata](#7-listobjectsv2withmetadata) |   | [removeObjects](#7-removeobjects)
[listIncompleteUploads](#8-listincompleteuploads) |   | [removeIncompleteUpload](#8-removeincompleteupload)
  |  |  
  |  |  
**[Presigned Operations](#presigned-operations)** | **[Bucket Notification Operations](#bucket-notification-operations)** | **[Bucket Policy Operations](#bucket-policy-operations)**
[presignedUrl](#1-presignedurl) | [getBucketNotification](#1-getbucketnotification) | [getBucketPolicy](#1-getbucketpolicy)
[presignedGetObject](#2-presignedgetobject) | [setBucketNotification](#2-setbucketnotification) | [setBucketPolicy](#2-setbucketpolicy)
[presignedPutObject](#3-presignedputobject) | [removeAllBucketNotification](#3-removeallbucketnotification) |  
[presignedPostPolicy](#4-presignedpostpolicy) | [listenBucketNotification](#4-listenbucketnotification) |  


### Passing in parameters ###
For each operation, parameters can either be set in the Edit Node dialogue, or passed in to the node via the node input. Parameters passed in will override any parameters 
set in the Edit Node dialogue.

The **_Operation_** in each case can be passed in to the node by setting the appropriate incoming value of `msg.operation`


# Bucket Operations #

## 1. *makeBucket* ##

### Description ###
Creates a new bucket.

### Parameters ###
Name       | Parameter<br>(`passed in as`)      | Description
:--------- | :------------------------------ | :----------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`) | Name of the bucket to be created
![region]**Region** | `region`<br>(`msg.region`)         | Region where the bucket is to be created. (optional)

### Node Outputs ###
Name       | Description
:--------- | :----------
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the bucket was created, e.g. `{"makeBucket":true}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 2. *listBuckets* ##

### Description ###
List all buckets.

### Parameters ###
No parameters required.

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output a JS object in the form `{"listBuckets":[...]}` containing an array of objects in the form `{"name":"bucketname","creationDate": "yyyy-mm-ddThh:mm:ss.sssZ"}` for each bucket.
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.
 

## 3. *bucketExists* ##

### Description ###
Checks if a bucket exists.

### Parameters ###
Name       | Parameter<br>(`passed in as`)      | Description
:--------- | :------------------------------ | :----------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`) | Name of the bucket to be checked.

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the bucket exists, e.g. `{"bucketExists":true}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.
 

## 4. *removeBucket* ##

### Description ###
Removes a bucket.

### Parameters ###
Name       | Parameter<br>(`passed in as`)      | Description
:--------- | :------------------------------ | :----------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`) | Name of the bucket to be removed.

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the bucket has been removed, e.g. `{"removeBucket":true}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 5. *listObjects* ##

### Description ###
Lists all objects in a bucket.

### Parameters ###
Name          | Parameter<br>(`passed in as`)      | Description
:------------ | :------------------------------ | :----------
![bucket]**Bucket**    | `bucketName`<br>(`msg.bucketName`) | Name of the bucket for which the objects listing is required.
![prefix]**Prefix**    | `prefix`<br>(`msg.prefix`)         | The prefix of the objects that should be listed. (optional).
![recursive]**Recursive** | `recursive`<br>(`msg.recursive`)   | `true` indicates recursive style listing and `false` indicates directory style listing delimited by '/'. (optional, default `false`).

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output a JS object in the form `{"listObjects":[...]}` containing an array of JS objects in the form `{"name":"objectname", "lastModified": "yyyy-mm-ddThh:mm:ss.sssZ", "etag":"etagstring", "size":1234}` for each object returned.
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 6. *listObjectsV2* ##
### Description ###
Lists all objects in a bucket using S3 listing objects V2 API.

### Parameters ###
Name            | Parameter<br>(`passed in as`)      | Description
:-------------- | :------------------------------ | :----------
![bucket]**Bucket**      | `bucketName`<br>(`msg.bucketName`) | Name of the bucket for which the objects listing is required.
![prefix]**Prefix**      | `prefix`<br>(`msg.prefix`)         | The prefix of the objects that should be listed. (optional).
![recursive]**Recursive**   | `recursive`<br>(`msg.recursive`)   | `true` indicates recursive style listing and `false` indicates directory style listing delimited by '/'. (optional, default `false`).
![startAfter]**Start After** | `startAfter`<br>(`msg.startAfter`) | Specifies the object name to start after, when listing objects in a bucket. (optional).

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output a JS object in the form `{"listObjectsV2":[...]}` containing an array of JS objects in the form `{"name":"objectname", "lastModified": "yyyy-mm-ddThh:mm:ss.sssZ", "etag":"etagstring", "size":1234}` for each object returned.
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 7. *listObjectsV2WithMetadata* ##

### Description ###
Lists all objects and their metadata in a bucket using S3 listing objects V2 API.

### Parameters ###
Name            | Parameter<br>(`passed in as`)      | Description
:-------------- | :------------------------------ | :---------
![bucket]**Bucket**      | `bucketName`<br>(`msg.bucketName`) | Name of the bucket for which the objects listing is required.
![prefix]**Prefix**      | `prefix`<br>(`msg.prefix`)         | The prefix of the objects that should be listed. (optional).
![recursive]**Recursive**   | `recursive`<br>(`msg.recursive`)   | `true` indicates recursive style listing and `false` indicates directory style listing delimited by '/'. (optional, default `false`).
![startAfter]**Start After** | `startAfter`<br>(`msg.startAfter`) | Specifies the object name to start after, when listing objects in a bucket. (optional).

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output a JS object in the form `{"listObjectsV2WithMetadata":[...]}` containing an array of JS objects in the form `{"name":"objectname", "lastModified": "yyyy-mm-ddThh:mm:ss.sssZ", "etag":"etagstring", "size":1234, "metadata":{...} }` for each object returned.
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 8. *listIncompleteUploads* ##

### Description ###
Lists partially uploaded objects in a bucket.

### Parameters ###
Name          | Parameter<br>(`passed in as`)      | Description
:------------ | :------------------------------ | :----------
![bucket]**Bucket**    | `bucketName`<br>(`msg.bucketName`) | Name of the bucket.
![prefix]**Prefix**    | `prefix`<br>(`msg.prefix`)         | Prefix of the object names that are partially uploaded. (optional).
![recursive]**Recursive** | `recursive`<br>(`msg.recursive`)   | `true` indicates recursive style listing and `false` indicates directory style listing delimited by '/'. (optional, default `false`).

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output a JS object in the form `{"listIncompleteUploads":[...]}` containing an array of JS objects in the form `{"key":"objectname", "uploadId": "uploadidstring", "size":1234}` for each object returned.
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.
 
___

# File Object Operations #

## 1. *fGetObject* ##

### Description ###
Downloads and saves the object as a file in the local filesystem.

### Parameters ###
Name       | Parameter<br>(`passed in as`)    | Description
:--------- | :---------------------------- | :---------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`) | Name of the bucket.
![file]**file**   | `objectName`<br>(`msg.objectName`) | Name of the object.
![path]**Path**   | `filePath`<br>(`msg.filePath`)     | Path on the local filesystem to which the object data will be written.

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the object could be downloaded as a file, e.g. `{"fGetObject":true}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 2. *fPutObject* ##

### Description ###
Uploads contents from a file to objectName.

The maximum size of a single object is limited to 5TB. fPutObject transparently uploads objects larger than 64MiB in multiple parts. Uploaded data is carefully verified using MD5SUM signatures.

### Parameters ###
Name         | Parameter<br>(`passed in as`)    | Description
:----------- | :---------------------------- | :----------
![bucket]**Bucket**   | `bucketName`<br>(`msg.bucketName`) | Name of the bucket.
![file]**file**     | `objectName`<br>(`msg.objectName`) | Name of the object.
![path]**Path**     | `filePath`<br>(`msg.filePath`)     | Path of the file to be uploaded.
![metaData]**MetaData** | `metaData`<br>(`msg.metaData`)     | Metadata of the object (optional).

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output a JS object, containing confirmation as to whether or not the file object was successfully uploaded, and, if successful, an etag value for the uploaded file object, e.g. `{"fPutObject":true,"etag":"etagvaluestring"}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.

___

# Object Operations #

## 1. *getObject* ##
### Description ###
Downloads an object as a stream.

### Parameters ###
Name       | Parameter<br>(`passed in as`)          | Description
:--------- | :---------------------------------- | :----------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`)       | Name of the bucket.
![file]**Object** | `objectName`<br>(`msg.objectName`)       | Name of the object.

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | TBC
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 2. *getPartialObject*
### Description ###
Downloads the specified range bytes of an object as a stream.

### Parameters ###
Name       | Parameter<br>(`passed in as`)    | Description
:--------- | :---------------------------- | :----------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`) | Name of the bucket.
![file]**Object** | `objectName`<br>(`msg.objectName`) | Name of the object.
![offset]**Offset** | `offset`<br>(`msg.offset`)         | Offset of the object from where the stream will start.
![length]**Length** | `length`<br>(`msg.length`)         | Length of the object that will be read in the stream (optional, if not specified we read the rest of the file from the offset).

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | TBC
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 3.*putObject* ##
### Description ###
Uploads an object from a stream/Buffer.

The maximum size of a single object is limited to 5TB. 
putObject transparently uploads objects larger than 64MiB in multiple parts. 
Uploaded data is carefully verified using MD5SUM signatures.

### Parameters ###
Name          | Parameter<br>(`passed in as`)    | Description
:------------ | :---------------------------- | :----------
![bucket]**Bucket**    | `bucketName`<br>(`msg.bucketName`) | Name of the bucket.
![file]**Object**    | `objectName`<br>(`msg.objectName`) | Name of the object.
![stream]**Stream**    | `stream`<br>(`msg.stream`)         | Readable stream.
![size]**Size**      | `size`<br>(`msg.size`)             | Size of the object (optional).
![metaData]**Meta Data** | `metaData`<br>(`msg.metaData`)     | Meta data of the object (optional).

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the object PUT operation was successful, including (if appropriate) the etag reference of the object, , e.g. `{"bucketExists":true, "etag":etagstring}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 4. *copyObject* ##
### Description ###
Copy a source object into a new object in the specified bucket.

### Parameters ###
Name                        | Parameter<br>(`passed in as`)                                        | Description
:-------------------------- | :------------------------------------------------------------------- | :----------
![bucket]**Bucket**         | `bucketName`<br>(`msg.bucketName`)                                   | Name of the bucket.
![file]**Object**           | `objectName`<br>(`msg.objectName`)                                   | Name of the object.
![sourceObject]**Source**   | `sourceObject`<br>(`msg.sourceObject`)                                     | Path of the file to be copied, in the format `bucketname/objectname`
![size]**Size**             | `size`<br>(`msg.size`)                                               | Conditions to be satisfied before allowing object copy.
![tag]**ETag**              | `setMatchEtag`<br>(`msg.setMatchEtag`)                               | Conditions to be satisfied before allowing object copy.
![tag]**Except ETag**       | `setMatchEtagExcept`<br>(`msg.setMatchEtagExcept`)                   | Conditions to be satisfied before allowing object copy.
![calendar]**Modified**     | `setModified`<br>(`msg.setModified`)                                 | Conditions to be satisfied before allowing object copy.
![metaData]**MetaData**     | `setReplaceMetadataDirective`<br>(`msg.setReplaceMetadataDirective`) | Conditions to be satisfied before allowing object copy.
![calendar]**Unmodified**   | `setUnmodified`<br>(`msg.setUnmodified`)                             | Conditions to be satisfied before allowing object copy.


### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the object has been copied, e.g. `{"copyObject":true}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 5. *statObject* ##
### Description ###
Lists all objects in a bucket.

### Parameters ###
Name                      | Parameter<br>(`passed in as`)      | Description
:------------------------ | :--------------------------------- | :----------
![bucket]**Bucket**       | `bucketName`<br>(`msg.bucketName`) | Name of the bucket for which the objects listing is required.
![prefix]**Prefix**       | `prefix`<br>(`msg.prefix`)         | The prefix of the objects that should be listed. (optional).
![recursive]**Recursive** | `recursive`<br>(`msg.recursive`)   | `true` indicates recursive style listing and `false` indicates directory style listing delimited by '/'. (optional, default `false`).

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output a JS object in the form `{"listObjects":[...]}` containing an array of JS objects in the form `{"name":"objectname", "lastModified": "yyyy-mm-ddThh:mm:ss.sssZ", "etag":"etagstring", "size":1234}` for each object returned.
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 6. *removeObject* ##
### Description ###
Lists all objects in a bucket using S3 listing objects V2 API.

### Parameters ###
Name                         | Parameter<br>(`passed in as`)      | Description
:--------------------------- | :--------------------------------- | :----------
![bucket]**Bucket**          | `bucketName`<br>(`msg.bucketName`) | Name of the bucket for which the objects listing is required.
![prefix]**Prefix**          | `prefix`<br>(`msg.prefix`)         | The prefix of the objects that should be listed. (optional).
![recursive]**Recursive**    | `recursive`<br>(`msg.recursive`)   | `true` indicates recursive style listing and `false` indicates directory style listing delimited by '/'. (optional, default `false`).
![startAfter]**Start After** | `startAfter`<br>(`msg.startAfter`) | Specifies the object name to start after, when listing objects in a bucket. (optional).

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output a JS object in the form `{"listObjectsV2":[...]}` containing an array of JS objects in the form `{"name":"objectname", "lastModified": "yyyy-mm-ddThh:mm:ss.sssZ", "etag":"etagstring", "size":1234}` for each object returned.
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 7. *removeObjects* ##
### Description ###
Removes all objects in a specified bucket matching an optional prefix value, or a defined list of object names.

### Parameters ###
Name                      | Parameter<br>(`passed in as`)        | Description
:------------------------ | :----------------------------------- | :----------
![bucket]**Bucket**       | `bucketName`<br>(`msg.bucketName`)   | Name of the bucket.
![list]**Objects List**   | `objectsList`<br>(`msg.objectsList`) | Explicit list of objects in the bucket to be removed (Optional). Should be provided as an array of object names, e.g. `[ "object_01", "object_02", "object_03" ]`. If left blank, then all objects in the specified bucket will be removed (subject to any value specified in the prefix field).
![prefix]**Prefix**       | `prefix`<br>(`msg.prefix`)           | The prefix of the objects that should be removed (Optional). If no prefix is provided, then all objects within the specified bucket will be removed, unless an explicit list of objects is provided in the Objects List field.

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the list of objects have been removed, e.g. `{"removeObjects":true}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 8. *removeIncompleteUpload* ##
### Description ###
Lists partially uploaded objects in a bucket.

### Parameters ###
Name                      | Parameter<br>(`passed in as`)      | Description
:------------------------ | :--------------------------------- | :----------
![bucket]**Bucket**       | `bucketName`<br>(`msg.bucketName`) | Name of the bucket.
![prefix]**Prefix**       | `prefix`<br>(`msg.prefix`)         | Prefix of the object names that are partially uploaded. (optional).
![recursive]**Recursive** | recursive (`msg.recursive`)        | `true` indicates recursive style listing and `false` indicates directory style listing delimited by '/'. (optional, default `false`).

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output a JS object in the form `{"listIncompleteUploads":[...]}` containing an array of JS objects in the form `{"key":"objectname", "uploadId": "uploadidstring", "size":1234}` for each object returned.
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.

___

# Presigned Operations #

## 1. *presignedURL* ##
### Description ###
Generates a presigned URL for the provided HTTP method, 'httpMethod'.

Browsers/Mobile clients may point to this URL to directly download objects 
even if the bucket is private. This presigned URL can have an associated 
expiration time in seconds after which the URL is no longer valid. 
The default value is 7 days.

### Parameters ###
Name                      | Parameter<br>(`passed in as`)        | Description
:------------------------ | :----------------------------------- | :----------
![bucket]**Bucket**       | `bucketName`<br>(`msg.bucketName`)   | Name of the bucket.
![file]**Object**         | `objectName`<br>(`msg.objectName`)   | Name of the object.
![expiry]**Expiry**       | `expiry`<br>(`msg.expiry`)           | Expiry time in seconds. Default value is 7 days. (optional)
![params]**Params**       | `reqParams`<br>(`msg.reqParams`)     | Request parameters. (optional)
![calendar]**Issue Date** | `requestDate`<br>(`msg.requestDate`) | A date object, the url will be issued at. Default value is now. (optional)

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | If successful, the node will output a JS object, containing the generated presigned URL, e.g. `{ "presignedURL": presignedUrl }`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.

## 2. *presignedGetObject* ##

### Description ###
Generates a presigned URL for HTTP GET operations.
Browsers/Mobile clients may point to this URL to directly download objects even if the bucket is private. This presigned URL can have an associated expiration time in seconds after which the URL is no longer valid. The default value is 7 days.


### Parameters ###
Name                      | Parameter<br>(`passed in as`)        | Description
:------------------------ | :----------------------------------- | :----------
![bucket]**Bucket**       | `bucketName`<br>(`msg.bucketName`)   | Name of the bucket.
![file]**Object**         | `objectName`<br>(`msg.objectName`)   | Name of the object.
![expiry]**Expiry**       | `expiry`<br>(`msg.expiry`)           | Expiry time in seconds. Default value is 7 days. (optional)
![headers]**Headers**     | `respHeaders`<br>(`msg.respHeaders`) | Response headers to override (optional)
![calendar]**Issue Date** | `requestDate`<br>(`msg.requestDate`) | A date object, the url will be issued at. Default value is now. (optional)

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | If successful, the node will output a JS object, containing the generated presigned GET object URL, e.g. `{ "presignedURL": presignedUrl }`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.

## 3. *presignedPutObject* ##
### Description ###
Generates a presigned URL for HTTP PUT operations. 
Browsers/Mobile clients may point to this URL to upload objects 
directly to a bucket even if it is private. This presigned URL 
can have an associated expiration time in seconds after which the 
URL is no longer valid. The default value is 7 days.

### Parameters ###
Name                | Parameter<br>(`passed in as`)      | Description
:------------------ | :--------------------------------- | :----------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`) | Name of the bucket.
![file]**Object**   | `objectName`<br>(`msg.objectName`) | Name of the object.
![expiry]**Expiry** | `expiry`<br>(`msg.expiry`)         | Expiry time in seconds. Default value is 7 days. (optional)

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | If successful, the node will output a JS object, containing the generated presigned PUT object URL, e.g. `{ "presignedURL": presignedUrl }`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.

## 4. *presignedPostPolicy* ##
### Description ###
Allows setting policy conditions to a presigned URL for POST operations. 
Policies such as bucket name to receive object uploads, key name prefixes, 
expiry policy may be set.

### Parameters ###
Name           | Parameter<br>(`passed in as`)                                             | Description
:------------- | :--------------------------------------------------------------------- | :----------
![bucket]**Bucket**     | `policy.setBucket`<br>(`msg.policy.setBucket`)                              | Policy restricting bucket for upload (optional).
![file]**Key**        | `policy.setKey`<br>(`msg.policy.setKey`)                                    | Policy restricting object Key for upload (optional).
**Key Prefix** | `policy.setKeyStartsWith`<br>(`msg.policy.setKeyStartsWith`)                | Policy restricting object Key prefix for upload (optional).
![expiry]**Expiry**     | `policy.setExpires`<br>(`msg.policy.setExpires`)                            | Expiry time of the policy, in seconds (optional).
![type]**Type**       | `policy.setContentType`<br>(`msg.policy.setContentType`)                    | Policy restricting content type for upload, e.g. `text/plain` (optional).
![sizeFrom]**Size: From** | `policy.setContentLengthRange`<br>(`msg.policy.setContentLengthRange.from`) | The lower end of the range of content length for the upload, in bytes, e.g. `1024` (optional).
![sizeTo]**Size: To**   | `policy.setContentLengthRange`<br>(`msg.policy.setContentLengthRange.to`)   | The upper end of the range of content length for the upload, in bytes, e.g. `1024*1024` (optional).

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | If successful, the node will output a JS object, containing the details of the submitted policy, e.g. `{ "presignedPostPolicy": { "postURL": url, "formData": {...} } }`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.

___

# Bucket Notification Operations #
For each operation, paramenters can either be set in the Edit Node dialogue, or passed in to the node via the node input. Parameters passed in will override any parameters set in the Edit Node dialogue.

The bucket **_Operation_** can be passed in to the node by setting the appropriate incoming value of `msg.operation`

## 1. *getBucketNotification* ##
### Description ###
Creates a new bucket.

### Parameters ###
Name                | Parameter<br>(`passed in as`)      | Description
:------------------ | :--------------------------------- | :----------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`) | Name of the bucket to be created.
![region]**Region** | `region`<br>(`msg.region`)         | Region where the bucket is to be created. (optional)

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the bucket was created, e.g. `{"makeBucket":true}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.

## 2. *setBucketNotification* ##
### Description ###
List all buckets.

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output a JS object in the form `{"listBuckets":[...]}` containing an array of objects in the form `{"name":"bucketname","creationDate": "yyyy-mm-ddThh:mm:ss.sssZ"}` for each bucket.
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.

## 3. *removeAllBucketNotification* ##
### Description ###
Checks if a bucket exists.

### Parameters ###
Name       | Parameter<br>(`passed in as`)   | Description
:--------- | :--------------------------- | :----------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`) | Name of the bucket to be checked.

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the bucket exists, e.g. `{"bucketExists":true}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.

## 4. *listenBucketNotification* ##
### Description ###
Removes a bucket.

### Parameters ###
Name       | Parameter<br>(`passed in as`)   | Description
:--------- | :--------------------------- | :----------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`) | Name of the bucket to be removed.

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the bucket has been removed, e.g. `{"removeBucket":true}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.

___

# Bucket Policy Operations #
For each operation, paramenters can either be set in the Edit Node dialogue, or passed in to the node via the node input. Parameters passed in will override any parameters 
set in the Edit Node dialogue.

The bucket **_Operation_** can be passed in to the node by setting the appropriate incoming value of `msg.operation`

## 1. *getBucketPolicy* ##
### Description ###
Get the bucket policy associated with the specified bucket. If `objectPrefix`
is not empty, the bucket policy will be filtered based on object permissions
as well.

### Parameters ###
Name       | Parameter<br>(`passed in as`)   | Description
:--------- | :--------------------------- | :----------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`) | Name of the bucket.

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the bucket policy exists, and if it does, the details of the policy, e.g. `{"getBucketPolicy":true, "policy":{...} }`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.


## 2. *setBucketPolicy* ##
### Description ###
Set the bucket policy on the specified bucket. [bucketPolicy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) is detailed here.

### Parameters ###
Name       | Parameter<br>(`passed in as`)       | Description
:--------- | :------------------------------- | :----------
![bucket]**Bucket** | `bucketName`<br>(`msg.bucketName`)     | Name of the bucket.
![policy]**Policy** | `bucketPolicy`<br>(`msg.bucketPolicy`) | Bucket policy.

### Node Outputs ###
Name       | Description
:--------- | :---------- 
**Output** | The node will output confirmation, in the form of a JS object, as to whether or not the bucket policy has been set, e.g. `{"setBucketPolicy":true}`
**Error**  | Any errors received in response to the request will be passed to the node's 'Error' output.
___

[bucket]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/database.png
[region]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/globe.png
[prefix]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/step-backward.png
[recursive]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/repeat.png
[startAfter]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/arrow-down.png
[file]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/file.png
[path]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/folder-open.png
[metaData]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/info.png
[offset]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/wrench.png
[length]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/arrows-h.png
[stream]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/wrench.png
[size]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/expand.png
[sourceObject]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/clone.png
[conditions]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/book.png
[expiry]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/clock-o.png
[tag]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/tag.png
[calendar]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/calendar.png
[list]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/list.png
[params]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/wrench.png
[headers]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/wrench.png
[type]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/code.png
[sizeFrom]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/long-arrow-left.png
[sizeTo]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/long-arrow-right.png
[policy]: https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/16/book.png

Copyright © 2020 Colin Payne
