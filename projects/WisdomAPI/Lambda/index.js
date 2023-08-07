import aws from 'aws-sdk';
import axios from 'axios';
// upload lambda layer to use the libraries above. See blog for detailed instructions on creating a layer

const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const wisdom = new aws.Wisdom({});

const knowledgeBaseId = process.env.KNOWLEDGE_BASE_ID;
// remember to create an environment variable

// function to upload content
async function upload(s3Object) {
    const uploadDetails = await wisdom.startContentUpload({
        knowledgeBaseId: knowledgeBaseId,
        contentType: s3Object.ContentType
    }).promise();

    await axios.put(uploadDetails.url, s3Object.Body, {
        headers: uploadDetails.headersToInclude
    });

    console.info("Uploaded content");
    return uploadDetails.uploadId;
}

export const handler = async (event, context) => {
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

    // S3 event type is delete
    if (event.Records[0].eventName.startsWith('ObjectRemoved')) {
        if (!existingContent) {
            return;
        }

        console.info("Deleting content");

        // delete content
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

    // check to see if file already exists
    if (existingContent) {
        // check if existing content matches S3 version from event body. If so, it is the same file and there is nothing to do
        if (existingContent.metadata['sourceS3Version'] === version) {
            return;
        }

        console.info("Updating content");

        // update case
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

        console.info("Creating content");

        // create case
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