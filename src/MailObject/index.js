const AWS = require('aws-sdk');
const sgMail = require('@sendgrid/mail');

const s3 = new AWS.S3();

exports.handler = async event => {
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
  let getObjResult = await s3.getObject(params).promise();


  const msg = {
    to: objTags.email,
    from: 'info@wildrydes.com',
    subject: objTags.subject,
    text: getObjResult.Body.toString('utf-8'),
    mail_settings: {
      sandbox_mode: {
        enable: true
      }
    }
  };

  try {
    await sgMail.send(msg);
  } catch (err) {
    console.log(err);
  }
}


