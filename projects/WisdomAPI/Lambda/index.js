const axios = require('axios');
const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const wisdom = new aws.Wisdom({ endpoint: 'https://wisdom.us-west-2.gamma.internal.clover.aws.dev' });

const knowledgeBaseId = '4120bf35-7dc4-46dd-b58c-21774a2ba6a9';

async function upload(s3Object) {
    const uploadDetails = await wisdom.startContentUpload({
        knowledgeBaseId: knowledgeBaseId,
        contentType: s3Object.ContentType
    }).promise();

    await axios.put(uploadDetails.url, s3Object.Body, {
        headers: uploadDetails.headersToInclude
    });

    return uploadDetails.uploadId;
}

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const version = event.Records[0].s3.object.versionId;

    // check to see if content with this key as its name already exists in Wisdom

    const searchResponse = await wisdom.searchContent({
        knowledgeBaseId: knowledgeBaseId,
        searchExpression: {
            filters: [{
                field: 'name',
                operator: 'equals',
                value: key
            }]
        }
    }).promise();
    const existingContent = searchResponse.contentSummaries[0];

    if (event.Records[0].eventName.startsWith('ObjectRemoved')) {
        if (!existingContent) {
            console.log('received delete event for nonexistent content; nothing to do');
            return;
        }

        console.log('deleting content');

        await wisdom.deleteContent({
            knowledgeBaseId: knowledgeBaseId,
            contentId: existingContent.contentId
        }).promise();
        return;
    }

    const s3Object = await s3.getObject({
        Bucket: bucket,
        Key: key,
        VersionId: version
    }).promise();

    let content;
    if (existingContent) {
        console.log('content already exists');
        if (existingContent.metadata['sourceS3Version'] === version) {
            console.log('S3 version and Wisdom version match; nothing to do');
            return;
        }

        console.log('calling update')
        content = await wisdom.updateContent({
            knowledgeBaseId: knowledgeBaseId,
            contentId: existingContent.contentId,
            revisionId: existingContent.revisionId,
            uploadId: await upload(s3Object),
            metadata: {
                'sourceS3Version': version
            }
        }).promise();
    } else {
        console.log('content does not yet exist; calling create')
        content = await wisdom.createContent({
            knowledgeBaseId: knowledgeBaseId,
            name: key,
            uploadId: await upload(s3Object),
            metadata: {
                'sourceS3Version': version
            }
        }).promise();
    }

    return content;
};