---
title: Encrypted Container Secrets with Terraform and S3
---

Using Terraform to manage containers on ECS gives an excellent
workflow. All your infrastructure, your entire app, from servers to
the processes running on them can be defined in a single place. But,
one place people often fall down with Terraform is secret management.
Too often a (perfectly reasonable) desire to keep the entire app
definition in a single repository, and mange it with Terraform leads
to database passwords, TLS certificates, and other sensitive
information being checked into the repository.

Checking in secrets makes it far too easy to accidentally leak them.
You also get no granular access control of any sort. Anyone with
access to the manifests repository now has the keys to the kingdom.

There are several proposed solutions to managing secrets for ECS,
either [using Parameter
Store](https://aws.amazon.com/blogs/compute/managing-secrets-for-amazon-ecs-applications-using-parameter-store-and-iam-roles-for-tasks/),
or [using
S3](https://aws.amazon.com/blogs/security/how-to-manage-secrets-for-amazon-ec2-container-service-based-applications-by-using-amazon-s3-and-docker/).
Both of these are better than nothing, but both also sacrifice your
ability to securely manage the secrets with Terraform. While the S3 solution
does give us server-side encryption for the secrets while on S3, they
must still be stored decrypted in the Terraform repo.

## The Key

At the core of solving this conundrum is KMS, AWS' Key Management
Service. By creating your master key in KMS and controlling who has
access to it, you can get granular access control to your secrets. By
using the key in KMS to encrypt secrets stored in the Terraform repo,
you can manage the system while keeping secrets completely opaque to
anyone looking in the repository.

## Creating the KMS Key

First, create the master encryption key in KMS. The key will never
leave KMS, so you will have to send data to it to be
encrypted/decrypted.

```
resource "aws_kms_key" "secrets" {
  description = "master encryption key for secrets"
}
```

Creating an alias to the key makes it easier to work with on the
command-line. By creating the alias, you can refer to the key as
`alias/secrets`, instead of by it's long ARN ID.

```
resource "aws_kms_alias" "secrets" {
  name          = "alias/secrets"
  target_key_id = "${aws_kms_key.secrets.key_id}"
}
```

Finally, you'll create an s3 bucket to store your secrets in. Because
S3 bucket names are global, you need to pick a name unique to you, and
unique to your environment. Secrets are often one of the things which
varies between environments. The staging DB password should never be
the same as the production DB password. To manage secrets for both
you want a separate bucket for each.

```
# Bucket where you store the encrypted secrets (one-per-object)
resource "aws_s3_bucket" "secrets" {
  bucket = "${terraform.env}-secrets"
  acl    = "private"
}
```

Once you've added these stanzas to your Terraform config, you should
run them to create the empty infrastructure for your secret storage.

## Adding Your Secrets

Now that your infrastructure is ready, you can begin adding your first
secrets.

To do that, you'll add this (slightly magic) Terraform expression:

```
variable "files" {
  description = "List of encrypted secret files to upload for this environment. Files must be in ./<env>/<service>/*"
  type = "list"
  default = []
}

# Upload every file listed in var.files. This lets us specify different
# secret files for different environments, which makes it easier to set up new
# environments.
resource "aws_s3_bucket_object" "files" {
  count = "${length(var.files)}"
  bucket = "${aws_s3_bucket.secrets.id}"
  key    = "${element(var.files, count.index)}"
  source = "${terraform.env}/${element(var.files, count.index)}"
  etag   = "${md5(file("${terraform.env}/${element(var.files, count.index)}"))}"
}
```

When you run this, it will look at a `${var.files}`, and upload each
of them to the the S3 bucket you just created. Files are organized
first by environment, then by service. This is arbitrary, but I find
it an easy way to stay organized.

To add a secret to your bucket, you need to encrypt it with the AWS
cli tool, put the encrypted result into your repository to be uploaded,
and add it to your `files` variable.

If you are encrypting a password for a service called `api`, you'd run
something like:

```
$ echo 'master-password' > plaintext-password
$ aws kms encrypt \
    --key-id alias/secrets \
    --plaintext fileb://plaintext-password \
    --output text --query CiphertextBlob | \
    base64 --decode > ./staging/api/encrypted-password
$ rm plaintext-password
```

This command will use your personal AWS credentials to send the
`master-password` off to be encrypted using the KMS key created
earlier. The resulting ciphertext is written out to
`./staging/api/encrypted-password`.

Add the file to the tfvars file of your environment. For example, for
staging, to `staging.tfvars`.

```
# staging.tfvars
files = [ "api/encrypted-password" ]
```

Then, when you run `aws_s3_bucket_object.files`, the file(s) listed
will be uploaded to the S3 bucket. If you need to change a secret
(to rotate passwords), all you need to do is update the file with the
new ciphertext and re-run Terraform.

## Checking the Secrets

To decrypt and check the secrets you would also use your personal
credentials to ask KMS to decrypt the secret file. Note, you don't
need to specify which key to use. The encryption format that the AWS
cli uses includes the KMS key ID in the encrypted ciphertext.

```
$ aws s3 cp s3://staging-secrets-bucket/api/encrypted-password .
$ aws kms decrypt \
    --ciphertext-blob fileb://encrypted-password \
    --output text --query Plaintext | \
    base64 --decode
master-password
```

To load the secrets in your program you do the same. Either with a
container entrypoint, such as:

```
#!/bin/bash

# Check that the environment variable has been set correctly
if [ -z "$SECRETS_BUCKET_NAME" ]; then
  echo >&2 'error: missing SECRETS_BUCKET_NAME environment variable'
  exit 1
fi

# Load the S3 secrets file contents into the environment variables
DB_PASSWORD="$(aws kms decrypt \
  --ciphertext-blob s3://${SECRETS_BUCKET_NAME}/api/encrypted-password \
  --output text --query Plaintext | \
  base64 --decode)"

# Call the original entry-point script
"$@"
```

If you wanted to be really generic, and a bit too clever, the above
script could even be extended to automatically detect and install new
secrets from the s3 folder:

```
...
# Recursively download an entire secrets subfolder
aws s3 cp --recursive s3://${SECRETS_BUCKET_NAME}/api /tmp/secrets/.
# Decrypt and install each secret as an environment variable
for f in $(ls /tmp/secrets); do
  let decrypted="$(aws kms decrypt \
    --ciphertext-blob fileb://${f} \
    --output text --query Plaintext | \
    base64 --decode)"
  eval "export ${f}=${decrypted}"
done
...
```

However, it is much more straightforward, and less error-prone to load
the secrets via in-application code. For Go (with error-handling
omitted), this looks like:

```
  sess, err := session.NewSession()
  cipher, err := s3.New(sess).GetObject(&s3.GetObjectInput{
    Bucket: "staging-secrets-bucket",
    Key:    "api/encrypted-password",
  })
  defer cipher.Body.Close()
  cipherBody, err := ioutil.ReadAll(cipher.Body)
  out, err := kms.New(sess).Decrypt(&kms.DecryptInput{
    CiphertextBlob: cipherBody,
  })
  // Print the plaintext
  fmt.Println(out.Plaintext)
```

Note, this does not use the `s3crypto` Go library, which is part of
the aws-sdk, as it makes different assumptions about how files are
stored on S3, than the AWS cli does, so they are incompatible.

## Giving Our Container Access

The tricky bit with this system is giving your ECS container
permissions to access only its own secrets. When you are defining your
ECS task, you have to set the `task_role_arn` option.

```
resource "aws_ecs_task_definition" "api_task" {
  task_role_arn = "${aws_iam_role.api_task_role.arn}"
}
```

This task role should be given a policy like:

```
data "aws_iam_policy_document" "api_task_policy" {
  # Note: For more security you probably want to only tasks services
  # to Decrypt secrets, not Encrypt.
  statement {
    sid       = "AllowEncryptDecryptWithSecretsKey",
    effect    = "Allow"
    actions   = ["kms:Encrypt","kms:Decrypt"]
    resources = ["${aws_kms_key.secrets.arn}"]
  }

  statement {
    sid = "AllowListingOfAPIFolder"
    effect = "Allow"
    actions = ["s3:ListBucket"]
    resources = ["${aws_s3_bucket.secrets.arn}"]
    condition {
      test = "StringLike"
      variable = "s3:prefix"
      values = ["api/*"]
    }
  }

  # Note: For more security you probably want to scope the actions
  # down to only include the s3:GetObject action.
  statement {
    sid = "AllowFullAccessInAPIFolder"
    effect = "Allow"
    actions = ["s3:*"]
    resources = ["${aws_s3_bucket.secrets.arn}/api/*"]
  }
}
```

With this policy attached to your ECS task, it should now be able to
read secrets from the given s3 bucket.

## Alternatives Considered

Terraform has a `aws_kms_secret` resource, which is where I got the
idea to use the AWS cli tool for encrypting the secrets. You could use
that to create the S3 objects, or even install the secrets directly as
environment variables (or flags) in your container definitions.

The first problem with using `aws_kms_secret` to create the S3 objects
is that you have to create a new Terraform resource for each secret to
upload. This is more work than just adding the file to the `files`
variable list. Secondly, the `aws_kms_secret` data is decrypted when
running Terraform, so the person running it must have permissions to
read and decrypt the secrets. If you are running your Terraform
scripts automatically (say as part of a CI pipeline deployment), that
is a security risk.

That leaves using `aws_kms_secret` resources to install secrets as
environment variables in the ECS task definitions. The problem is that
environment variables (and ECS task definitions) are more visible than
you would like your secrets to be. For example, they are shown several
places in the AWS UI, so storing secrets in environment variables or
flags is less secure than loading them at runtime.

## Nice Properties

This system has quite a few nice properties.

- Terraform scripts contain all information about the system.
- The only place secrets are decrypted is in-memory of a running
  process. They are never decrypted in the repository, or on S3.
- Fine-grained access-control. By changing who has permissions to
  encrypt and decrypt secrets with the KMS key you can change who has
  access to read and write secrets. By changing access to the S3
  bucket, you can control which secrets can be accessed by which
  services.
- Can run Terraform and operate the system without visibility of
  secrets.

## Extra Security Measures

For extra security you may want to consider creating the KMS master
key by hand. It only needs to be created once, but doing so will allow
you to separate permissions to run Terraform from permissions to
encrypt/decrypt secrets.

You may also want to consider giving less access to services, and
Terraform users. For example, you could give services
read-and-decrypt-only access, while giving Terraform users
write-and-encrypt-only access. This makes setting secrets write-only,
and ensures isolation between services. If you are automatically
running Terraform as part of a CI build/deployment step, you may want
to give that user no access to encrypt/decrypt secrets at all.
