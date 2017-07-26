---
layout: post
title: Connecting to Postgres RDS instances from Kubernetes (with SSL)
---

{{ page.title }}
----------------

##### 26 July, 2017

This is a short walk-through of how to connect to your Postgres RDS instance from Kubernetes securely over SSL. RDS instances are a great low-touch way to run a persistent database with replication, which doesn't add operational complexity to your containerized app.

We'll be using the go [pq](https://github.com/lib/pq) Postgres client as an example. The principles are common across Postgres clients, but may vary slightly.

I'm assuming for this guide that you already have a service set up and running on Kubernetes, connecting happily to a Postgres RDS instance. However, you haven't set up SSL yet. When connecting, you're probably using a URI like:

```
postgres://user:password@my-rds-instance.us-east-1.rds.amazonaws.com/db_name?sslmode=disable
```

## Adding SSL

To add SSL, you'll want to change the query parameter `?sslmode=disable` to `?sslmode=verify-full`, but to do that you'll need to add AWS' RDS root certificate. AWS provides the root certificate bundle [for download here](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html). You want the [combined certificate bundle here](https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem). Once you've downloaded that and added it into the container, then add `sslrootcert=rds-combined-ca-bundle.pem`, to your query parameters to tell `lib/pq` how to verify the server.

To mount the CA bundle into the container there are two options.

### Option 1 - Mount the CA into your container

If you're using Kubernetes, you've got this easy.

The easiest way is to check the cert into a config map.

```
kind: ConfigMap
apiVersion: v1
metadata:
  name: rds-combined-ca-bundle
data:
  rds-combined-ca-bundle.pem: |-
    ... contents of the file indented here ...
```
 By using a secret or config map you can mount the CA into your container like so:

```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: my-deployment
spec:
  template:
    spec:
      containers:
      - name: my-container
        image: my-image
        args:
        - -db=postgres://user:password@my-rds-instance.us-east-1.rds.amazonaws.com/db_name?sslmode=verify-full&sslrootcert=/root/.postgresql/rds-combined-ca-bundle.pem
        volumeMounts:
        - name: rds-combined-ca-bundle-volume
          mountPath: /root/.postgresql
      volumes:
      - name: rds-combined-ca-bundle-volume
        configMap:
          name: rds-combined-ca-bundle
```

### Option 2 - Build the CA into your image

It's rarely a good idea to include deployment-specific features directly in your container image. Based on that criteria, adding the bundle to your image is definitely the worse of the two options. I've included it here, as sometimes it *is* a necessary compromise.

If you've built the bundle into your image, you'll still need to add the `sslrootcert` parameter, as shown above.

## Requiring SSL

For extra security, you should enable the `rds.force_ssl` option on your RDS instance. This will reject any non-ssl connections, so you know all traffic is talking to your database securely.

The details are [in the AWS docs here](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html#PostgreSQL.Concepts.General.SSL.Requiring), but the overview, is that you'll need to set up a new DB Parameter Group for your database, so that you can modify the settings, and reboot the RDS instance to apply the changes.

## More Reading

- [AWS Docs on Using SSL to Encrypt a Connection to a DB Instance](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html)
- [lib/pq godoc with lots of examples](https://godoc.org/github.com/lib/pq)
