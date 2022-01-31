#!/bin/bash
# Test BankID Certificate Script
#
# This bash file will download the publically available SSL certificates.
# You will need to confirm the appropriate download url from:
# https://www.bankid.com/en/utvecklare/test
# 
# You will also need the publically available passphase for the SSL certificate.
# The latest information can be found:
# https://www.bankid.com/assets/bankid/rp/bankid-relying-party-guidelines-v3.5.pdf
#
# You can pass in the password as the first argument of this script and override
# the download URL as the second argument. 
# For example, if the password was qwerty123 the code to run the script would be
# ./get-latest-bankid-certificates.sh qwerty123
#
# To override the download URL simply copy the url after the password
# ./get-latest-bankid-certificates.sh qwerty123 https://www.bankid.com/assets/bankid/rp/FPTestcert3_20200618.p12
#

PASSWORD=$1
URL="${2:-https://www.bankid.com/assets/bankid/rp/FPTestcert3_20200618.p12}"

DOWNLOAD_FILE=test-bankid.p12
CODE_PATH=./code/bankid-auth

echo -e "Path for test certificate: \n    ${URL}"
echo -e "Downloading p12 certificate to ${DOWNLOAD_FILE}"
curl ${URL} --output ${DOWNLOAD_FILE}

echo -e "Unpacking test certificate into separate pem files"
openssl pkcs12 -info -nodes -in ${DOWNLOAD_FILE} -out ${CODE_PATH}/key.pem -nocerts -nodes -passin pass:${PASSWORD}
openssl pkcs12 -info -nodes -in ${DOWNLOAD_FILE} -out ${CODE_PATH}/cert.pem -clcerts -nokeys  -passin pass:${PASSWORD}

echo -e "Deleting downloaded p12 certificate ${DOWNLOAD_FILE}"
rm ${DOWNLOAD_FILE}