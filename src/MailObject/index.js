const AWS = require('aws-sdk');
const sgMail = require('@sendgrid/mail');

const s3 = new AWS.S3();

exports.handler = async (event, context) => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));
  await Promise.all(
    event.Records
      .map(record => record['s3'])
      .map(mailObject)
  );
};

async function mailObject(s3Obj) {
  let srcKey = decodeURIComponent(s3Obj.object.key.replace(/\+/g, " "))
  let srcBucket = s3Obj.bucket.name;
  let params = {
    Bucket: srcBucket,
    Key: srcKey
  }
  let getTaggingResult = await s3.getObjectTagging(params).promise();
  let objTags = Object.assign(
    {},
    ...Array.from(getTaggingResult.TagSet, (tag) => ({[tag.Key]: tag.Value}))
  );
  let objBody = await s3.getObject(params).promise().Body;


  // let sendParams = {
  //   Destination: {
  //     ToAddresses: [
  //       objTags.email,
  //     ],
  //   },
  //   Message: {
  //     Body: {
  //       Text: {
  //         Charset: "UTF-8",
  //         Data: objBody,
  //       },
  //     },
  //     Subject: {
  //       Charset: "UTF-8",
  //       Data: objTags.subject,
  //     },
  //   },
  //   Source: "info@wildrydes.com"
  // }
  const msg = {
    to: objTags.email,
    from: 'info@wildrydes.com',
    subject: objTags.subject,
    text: objBody,
    mail_settings: {
      sandbox_mode: {
        enable: true
      }
    }
  };

  await sgMail.send(msg);
}


