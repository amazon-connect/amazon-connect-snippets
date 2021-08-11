#!/bin/bash

# chmod +x deploy.sh
# ./deploy.sh

S3HostBucket=agentdesktophost-8c6179f0-d2c9-11eb-af16-0e1cfc6fd327
CloudFrontDistributionId=E34O8S9SHF8GZI

cd ./../webApp

npm install
npm run build

cd build

aws s3 rm s3://$S3HostBucket/ --recursive
aws s3 sync . s3://$S3HostBucket

aws cloudfront create-invalidation --distribution-id $CloudFrontDistributionId --paths "/*"

echo "!!!Refresh the web application after the invalidation completes: 1) Open the CloudFront Console 2) Select the distribution id 3) Select the Invalidations tab"